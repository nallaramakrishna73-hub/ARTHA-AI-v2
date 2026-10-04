/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';

import { seedDatabase } from './src/db/seed.ts';
import { db } from './src/db/index.ts';
import { users, portfolios, holdings, watchlists, watchlistItems, alerts, alertEvents, auditLogs } from './src/db/schema.ts';
import { eq, and } from 'drizzle-orm';

import { providerRouter } from './src/services/providerRouter.ts';
import { analyzeTechnical } from './src/analysis/technical.ts';
import { analyzeRisk } from './src/analysis/risk.ts';
import { scoreFundamentals } from './src/analysis/fundamentals.ts';
import { analyzeSentiment } from './src/analysis/sentiment.ts';
import { analyzeMacro } from './src/analysis/macro.ts';
import {
  computePortfolioAnalytics,
  optimizePortfolio,
  simulateWhatIfShock,
} from './src/analysis/portfolio.ts';
import {
  calculateBlackScholes,
  calculateFuturesFairValue,
  calculateBondPricing,
} from './src/analysis/calculators.ts';
import { researchAgent } from './src/agent/researchAgent.ts';
import { alertEngine } from './src/services/alertEngine.ts';
import { getMarketSessionStatus } from './src/utils/format.ts';
import { DISCLAIMER_TEXT, APP_CONFIG } from './src/config/index.ts';
import { authMiddleware, generateTokens, AuthRequest } from './src/middleware/auth.ts';
import { validateSymbolParam, sanitizeInputText } from './src/middleware/validation.ts';
import { register, httpRequestsTotal, httpRequestDuration, agentRunsTotal } from './src/services/metrics.ts';
import { circuitBreaker } from './src/providers/circuitBreaker.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3000;

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many requests. Please try again later.' } },
});

const researchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Research generation rate limit reached (max 10/min).' } },
});

app.use(generalLimiter);

// Request tracking & metrics middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  res.setHeader('X-Request-ID', reqId);
  res.setHeader('X-Artha-AI-Version', '2.4.0');
  res.setHeader('X-Market-Jurisdiction', 'India-NSE-BSE');

  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ method: req.method, route: req.path, status: res.statusCode.toString() });
    httpRequestDuration.observe({ method: req.method, route: req.path, status: res.statusCode.toString() }, duration);
  });
  next();
});

// Gemini SDK initialization
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    })
  : null;

// ================= AUTHENTICATION ROUTES =================

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Email and password (min 6 chars) required.' } });
  }

  try {
    const existing = db.select().from(users).where(eq(users.email, email)).get();
    if (existing) {
      return res.status(400).json({ error: { code: 'USER_EXISTS', message: 'User with this email already exists.' } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr-${Date.now()}`;
    const now = new Date().toISOString();

    db.insert(users).values({ id: userId, email, passwordHash, role: 'user', createdAt: now }).run();

    // Create default watchlist & portfolio
    const portId = `port-${Date.now()}`;
    db.insert(portfolios).values({ id: portId, userId, name: 'Default Equity Portfolio', createdAt: now }).run();

    const tokens = generateTokens({ userId, email, role: 'user' });
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ user: { id: userId, email, role: 'user' }, accessToken: tokens.accessToken });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = db.select().from(users).where(eq(users.email, email)).get();
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    }

    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ user: { id: user.id, email: user.email, role: user.role }, accessToken: tokens.accessToken });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ status: 'ok', message: 'Logged out successfully' });
});

app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// ================= SYSTEM & METRICS ROUTES =================

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: APP_CONFIG.name,
    tagline: APP_CONFIG.tagline,
    marketStatus: getMarketSessionStatus(),
    geminiConfigured: !!ai,
    database: 'SQLite WAL Connected',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/metrics', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.get('/api/monitoring', (req: Request, res: Response) => {
  res.json({
    providers: [
      circuitBreaker.getStatus('yahoo'),
      circuitBreaker.getStatus('alphavantage'),
      circuitBreaker.getStatus('newsapi'),
      circuitBreaker.getStatus('rss'),
    ],
    apiUsageLogs: providerRouter.apiUsageLogs.slice(-20),
    isDemoMode: !process.env.GEMINI_API_KEY,
  });
});

// ================= MARKET & QUANT API ROUTES =================

app.get('/api/market/status', (req: Request, res: Response) => {
  res.json(getMarketSessionStatus());
});

app.get('/api/market/search', (req: Request, res: Response) => {
  const q = String(req.query.q || '');
  res.json(providerRouter.searchSymbols(q));
});

app.get('/api/market/quote/:symbol', validateSymbolParam, async (req: Request, res: Response) => {
  const quote = await providerRouter.getQuote(req.params.symbol);
  res.json(quote);
});

app.get('/api/market/history/:symbol', validateSymbolParam, async (req: Request, res: Response) => {
  const history = await providerRouter.getHistory(req.params.symbol);
  res.json(history);
});

app.get('/api/analysis/technical/:symbol', validateSymbolParam, async (req: Request, res: Response) => {
  const symbol = req.params.symbol;
  const bars = await providerRouter.getHistory(symbol);
  const result = analyzeTechnical(bars, symbol);
  res.json(result);
});

app.get('/api/analysis/fundamental/:symbol', validateSymbolParam, async (req: Request, res: Response) => {
  const result = await providerRouter.getFundamentals(req.params.symbol);
  res.json(result);
});

app.get('/api/analysis/sentiment/:symbol', validateSymbolParam, async (req: Request, res: Response) => {
  const symbol = req.params.symbol;
  const news = await providerRouter.getNews(symbol);
  const result = await analyzeSentiment(news, symbol);
  res.json(result);
});

app.get('/api/analysis/risk/:symbol', validateSymbolParam, async (req: Request, res: Response) => {
  const symbol = req.params.symbol;
  const bars = await providerRouter.getHistory(symbol);
  const niftyBars = await providerRouter.getHistory('^NSEI');
  const result = analyzeRisk(bars, niftyBars, symbol);
  res.json(result);
});

app.get('/api/macro/indicators', (req: Request, res: Response) => {
  const indicators = providerRouter.getMacroIndicators();
  const sector = String(req.query.sector || 'Financial Services');
  const analysis = analyzeMacro(sector);
  res.json({ indicators, analysis });
});

// ================= LANGGRAPH RESEARCH AGENT STREAMING =================

app.post('/api/research/run', researchLimiter, async (req: Request, res: Response) => {
  const symbol = String(req.body.symbol || 'RELIANCE.NS').toUpperCase().trim();
  agentRunsTotal.inc({ symbol, status: 'success' });

  // Stream Server-Sent Events (SSE) if Accept header contains text/event-stream
  if (req.headers.accept === 'text/event-stream') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const report = await researchAgent.runResearchWorkflow(symbol, (stepTrace) => {
        res.write(`data: ${JSON.stringify({ type: 'STEP_UPDATE', step: stepTrace })}\n\n`);
      });

      res.write(`data: ${JSON.stringify({ type: 'REPORT_COMPLETE', report })}\n\n`);
      return res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ type: 'ERROR', error: err.message })}\n\n`);
      return res.end();
    }
  }

  try {
    const report = await researchAgent.runResearchWorkflow(symbol);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: { message: err?.message || 'Agent pipeline execution failed' } });
  }
});

app.post('/api/research/compare', async (req: Request, res: Response) => {
  const symbol1 = String(req.body.symbol1 || 'TCS.NS').toUpperCase().trim();
  const symbol2 = String(req.body.symbol2 || 'INFY.NS').toUpperCase().trim();

  try {
    const rep1 = await researchAgent.runResearchWorkflow(symbol1);
    const rep2 = await researchAgent.runResearchWorkflow(symbol2);

    res.json({
      stock1: rep1,
      stock2: rep2,
      comparison: {
        higherScore: rep1.scores.overall >= rep2.scores.overall ? rep1.symbol : rep2.symbol,
        scoreDelta: Math.abs(rep1.scores.overall - rep2.scores.overall),
        radarData: [
          { category: 'Technical', stock1: rep1.scores.technical, stock2: rep2.scores.technical },
          { category: 'Fundamental', stock1: rep1.scores.fundamental, stock2: rep2.scores.fundamental },
          { category: 'Sentiment', stock1: rep1.scores.sentiment, stock2: rep2.scores.sentiment },
          { category: 'Resilience', stock1: rep1.scores.riskResilience, stock2: rep2.scores.riskResilience },
          { category: 'Macro Tailwind', stock1: rep1.scores.macro, stock2: rep2.scores.macro },
        ],
        synthesis: `Comparing ${rep1.companyName} (${rep1.symbol}: Score ${rep1.scores.overall}/100) and ${rep2.companyName} (${rep2.symbol}: Score ${rep2.scores.overall}/100). ${rep1.scores.overall >= rep2.scores.overall ? rep1.symbol : rep2.symbol} shows relative quantitative edge across composite weights. Both securities exhibit established market positions within their respective segments. This comparative inquiry is purely analytical and does not constitute an investment preference or recommendation.`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// ================= PORTFOLIO & WATCHLIST CRUD =================

app.get('/api/portfolios', async (req: Request, res: Response) => {
  const userPortfolios = db.select().from(portfolios).all();
  const portId = userPortfolios[0]?.id || 'port-demo-1';
  const dbHoldings = db.select().from(holdings).where(eq(holdings.portfolioId, portId)).all();

  // Enrich with live price quotes
  const enrichedHoldings = await Promise.all(
    dbHoldings.map(async (h) => {
      const q = await providerRouter.getQuote(h.symbol);
      const currentValue = Math.round(h.quantity * q.price);
      const investedValue = Math.round(h.quantity * h.avgBuyPrice);
      const pnl = Math.round(currentValue - investedValue);
      const pnlPercent = Math.round((pnl / investedValue) * 1000) / 10;
      return {
        id: h.id,
        symbol: h.symbol,
        name: h.name,
        sector: h.sector,
        quantity: h.quantity,
        avgBuyPrice: h.avgBuyPrice,
        currentPrice: q.price,
        currentValue,
        investedValue,
        pnl,
        pnlPercent,
        weightPct: 0,
        beta: 1.0,
        dailyVol: 1.8,
      };
    })
  );

  const totalVal = enrichedHoldings.reduce((sum, item) => sum + item.currentValue, 0);
  const normalizedHoldings = enrichedHoldings.map(item => ({
    ...item,
    weightPct: totalVal > 0 ? Math.round((item.currentValue / totalVal) * 1000) / 10 : 0,
  }));

  const analytics = computePortfolioAnalytics(normalizedHoldings);
  res.json({ holdings: normalizedHoldings, analytics });
});

app.post('/api/portfolios/optimize', async (req: Request, res: Response) => {
  const mode = req.body.mode || 'MAX_SHARPE';
  const cap = Number(req.body.cap) || 0.30;
  const portRes: any = await fetch(`http://127.0.0.1:${PORT}/api/portfolios`).then(r => r.json());
  const result = optimizePortfolio(portRes.holdings, mode, cap);
  res.json(result);
});

app.post('/api/portfolios/whatif', async (req: Request, res: Response) => {
  const shock = Number(req.body.shock) || -10;
  const portRes: any = await fetch(`http://127.0.0.1:${PORT}/api/portfolios`).then(r => r.json());
  const result = simulateWhatIfShock(portRes.holdings, shock);
  res.json(result);
});

// Watchlist CRUD
app.get('/api/watchlists', (req: Request, res: Response) => {
  const list = db.select().from(watchlists).all();
  const items = db.select().from(watchlistItems).all();
  res.json({ watchlists: list, items });
});

app.post('/api/watchlists/items', (req: Request, res: Response) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: { message: 'Symbol required' } });
  const itemId = `wli-${Date.now()}`;
  db.insert(watchlistItems).values({
    id: itemId,
    watchlistId: 'wl-demo-1',
    symbol: symbol.toUpperCase(),
    createdAt: new Date().toISOString(),
  }).run();
  res.json({ id: itemId, symbol });
});

// ================= ALERTS API ROUTES =================

app.get('/api/alerts', (req: Request, res: Response) => {
  const alertList = db.select().from(alerts).all();
  const events = db.select().from(alertEvents).all();
  res.json({ alerts: alertList, events });
});

app.post('/api/alerts', (req: Request, res: Response) => {
  const { symbol, conditionType, targetValue } = req.body;
  const alertId = `alt-${Date.now()}`;
  db.insert(alerts).values({
    id: alertId,
    userId: 'usr-demo-1',
    symbol: symbol.toUpperCase(),
    conditionType: conditionType || 'PRICE_ABOVE',
    targetValue: Number(targetValue) || 3000,
    active: true,
    createdAt: new Date().toISOString(),
  }).run();

  res.json({ id: alertId, symbol, conditionType, targetValue });
});

app.get('/api/alerts/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  alertEngine.registerSseClient(res);
  req.on('close', () => alertEngine.removeSseClient(res));
});

// ================= CALCULATORS =================

app.post('/api/calculators/options', (req: Request, res: Response) => {
  const result = calculateBlackScholes(req.body);
  res.json(result);
});

app.post('/api/calculators/futures', (req: Request, res: Response) => {
  const { spotPrice, futuresMarketPrice, daysToExpiry, riskFreeRate, dividendYield } = req.body;
  const result = calculateFuturesFairValue(spotPrice, futuresMarketPrice, daysToExpiry, riskFreeRate, dividendYield);
  res.json(result);
});

app.post('/api/calculators/bonds', (req: Request, res: Response) => {
  const { faceValue, couponRate, yearsToMaturity, frequency, ytm } = req.body;
  const result = calculateBondPricing(faceValue, couponRate, yearsToMaturity, frequency, ytm);
  res.json(result);
});

// Grounded AI Chat Assistant
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, contextSymbol = 'RELIANCE.NS' } = req.body;
  const cleanMsg = sanitizeInputText(message);

  const quote = await providerRouter.getQuote(contextSymbol);
  const bars = await providerRouter.getHistory(contextSymbol);
  const tech = analyzeTechnical(bars, contextSymbol);
  const fund = await providerRouter.getFundamentals(contextSymbol);
  const macro = analyzeMacro(quote.sector);

  const evidence = {
    symbol: contextSymbol,
    name: quote.name,
    price: quote.price,
    changePercent: quote.changePercent,
    peRatio: fund.peRatio,
    roe: fund.roe,
    rsi14: tech.rsi14,
    trend: tech.trend,
    ema50: tech.emas.ema50,
    ema200: tech.emas.ema200,
    macroScore: macro.macroScore,
    repoRate: '6.50%',
    cpiInflation: '5.12%',
  };

  const systemInstruction = `You are ARTHA AI, an Indian Financial Research and Intelligence Assistant specializing in NSE/BSE equities.
CRITICAL HARD RULES:
1. NEVER output buy/sell/hold calls, price targets, guaranteed returns, or personalized advice.
2. Formulate all commentary strictly as objective analytical observations.
3. NEVER invent numbers. All cited figures MUST be drawn directly from this EVIDENCE object:
${JSON.stringify(evidence, null, 2)}
4. Conclude every response with this exact disclaimer:
"${DISCLAIMER_TEXT}"`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User Query: ${cleanMsg}`,
        config: { systemInstruction, temperature: 0.2 },
      });

      const reply = response.text || 'Unable to formulate response from model.';
      return res.json({ reply, evidence });
    } catch (err: any) {
      console.error('Gemini call error:', err);
    }
  }

  const fallbackReply = `Regarding ${quote.name} (${contextSymbol}): The security is trading at ₹${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent}% on the day). Technical indicators highlight a ${tech.trend} regime with RSI(14) at ${tech.rsi14} and price aligned with key EMAs (50-EMA: ₹${tech.emas.ema50}). Trailing P/E stands at ${fund.peRatio}x with ROE at ${fund.roe}%. Macroeconomic indicators for the ${quote.sector} sector reflect a macro score of ${macro.macroScore}/100 in context of the RBI 6.50% repo rate.\n\n${DISCLAIMER_TEXT}`;

  res.json({ reply: fallbackReply, evidence });
});

// Vite Middleware for Development & Static File Serving
async function startServer() {
  await seedDatabase();
  alertEngine.init(server);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[ARTHA AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

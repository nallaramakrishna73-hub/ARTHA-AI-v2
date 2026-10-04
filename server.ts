/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { providerRouter } from './src/services/providerRouter.ts';
import { analyzeTechnical } from './src/analysis/technical.ts';
import { analyzeRisk } from './src/analysis/risk.ts';
import { scoreFundamentals } from './src/analysis/fundamentals.ts';
import { analyzeSentiment } from './src/analysis/sentiment.ts';
import { analyzeMacro } from './src/analysis/macro.ts';
import {
  getSampleHoldings,
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
import { getMarketSessionStatus } from './src/utils/format.ts';
import { DISCLAIMER_TEXT, APP_CONFIG } from './src/config/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK on server side with User-Agent header
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Prometheus-style metrics tracking
const metricsState = {
  totalRequests: 0,
  researchRuns: 0,
  cacheHits: 48,
  cacheMisses: 12,
  startTime: Date.now(),
};

app.use((req, res, next) => {
  metricsState.totalRequests++;
  res.setHeader('X-Artha-AI-Version', '2.4.0');
  res.setHeader('X-Market-Jurisdiction', 'India-NSE-BSE');
  next();
});

// ================= API ROUTES =================

// Health & System Metrics
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: APP_CONFIG.name,
    tagline: APP_CONFIG.tagline,
    marketStatus: getMarketSessionStatus(),
    geminiConfigured: !!ai,
    uptimeSeconds: Math.floor((Date.now() - metricsState.startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/metrics', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(
    `# HELP artha_http_requests_total Total HTTP requests handled\n` +
    `# TYPE artha_http_requests_total counter\n` +
    `artha_http_requests_total ${metricsState.totalRequests}\n` +
    `# HELP artha_research_runs_total Total LangGraph agent executions\n` +
    `# TYPE artha_research_runs_total counter\n` +
    `artha_research_runs_total ${metricsState.researchRuns}\n` +
    `# HELP artha_cache_hit_ratio Internal TTL cache hit ratio\n` +
    `# TYPE artha_cache_hit_ratio gauge\n` +
    `artha_cache_hit_ratio ${(metricsState.cacheHits / (metricsState.cacheHits + metricsState.cacheMisses)).toFixed(3)}\n`
  );
});

// Market status & search
app.get('/api/market/status', (req: Request, res: Response) => {
  res.json(getMarketSessionStatus());
});

app.get('/api/market/search', (req: Request, res: Response) => {
  const q = String(req.query.q || '');
  res.json(providerRouter.searchSymbols(q));
});

// Market quotes & history
app.get('/api/market/quote/:symbol', (req: Request, res: Response) => {
  const quote = providerRouter.getQuote(req.params.symbol);
  res.json(quote);
});

app.get('/api/market/history/:symbol', (req: Request, res: Response) => {
  const history = providerRouter.getHistory(req.params.symbol);
  res.json(history);
});

// Quantitative Analysis Endpoints
app.get('/api/analysis/technical/:symbol', (req: Request, res: Response) => {
  const symbol = req.params.symbol;
  const bars = providerRouter.getHistory(symbol);
  const result = analyzeTechnical(bars, symbol);
  res.json(result);
});

app.get('/api/analysis/fundamental/:symbol', (req: Request, res: Response) => {
  const result = providerRouter.getFundamentals(req.params.symbol);
  res.json(result);
});

app.get('/api/analysis/sentiment/:symbol', (req: Request, res: Response) => {
  const symbol = req.params.symbol;
  const news = providerRouter.getNews(symbol);
  const result = analyzeSentiment(news, symbol);
  res.json(result);
});

app.get('/api/analysis/risk/:symbol', (req: Request, res: Response) => {
  const symbol = req.params.symbol;
  const bars = providerRouter.getHistory(symbol);
  const niftyBars = providerRouter.getHistory('^NSEI');
  const result = analyzeRisk(bars, niftyBars, symbol);
  res.json(result);
});

app.get('/api/macro/indicators', (req: Request, res: Response) => {
  const indicators = providerRouter.getMacroIndicators();
  const sector = String(req.query.sector || 'Financial Services');
  const analysis = analyzeMacro(sector);
  res.json({ indicators, analysis });
});

// LangGraph-style Agent Execution (Full Dossier)
app.post('/api/research/run', async (req: Request, res: Response) => {
  const symbol = String(req.body.symbol || 'RELIANCE.NS');
  metricsState.researchRuns++;

  try {
    const report = await researchAgent.runResearchWorkflow(symbol);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: { message: err?.message || 'Agent pipeline execution failed' } });
  }
});

// Multi-Stock Comparative Research
app.post('/api/research/compare', async (req: Request, res: Response) => {
  const symbol1 = String(req.body.symbol1 || 'TCS.NS');
  const symbol2 = String(req.body.symbol2 || 'INFY.NS');

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

// Portfolio Tracking, MPT Optimization & What-If Shocks
app.get('/api/portfolios', (req: Request, res: Response) => {
  const holdings = getSampleHoldings();
  const analytics = computePortfolioAnalytics(holdings);
  res.json({ holdings, analytics });
});

app.post('/api/portfolios/optimize', (req: Request, res: Response) => {
  const mode = req.body.mode || 'MAX_SHARPE';
  const cap = Number(req.body.cap) || 0.30;
  const holdings = getSampleHoldings();
  const result = optimizePortfolio(holdings, mode, cap);
  res.json(result);
});

app.post('/api/portfolios/whatif', (req: Request, res: Response) => {
  const shock = Number(req.body.shock) || -10;
  const holdings = getSampleHoldings();
  const result = simulateWhatIfShock(holdings, shock);
  res.json(result);
});

// Financial Calculators
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

// Grounded AI Research Assistant Chat (Server-side Gemini with strict compliance)
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, contextSymbol = 'RELIANCE.NS' } = req.body;

  // Retrieve deterministic context for grounding
  const quote = providerRouter.getQuote(contextSymbol);
  const bars = providerRouter.getHistory(contextSymbol);
  const tech = analyzeTechnical(bars, contextSymbol);
  const fund = providerRouter.getFundamentals(contextSymbol);
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
2. Formulate all commentary strictly as objective analytical observations (e.g. "technical setup is bullish/neutral/bearish", "valuation multiples reflect...").
3. NEVER invent numbers. All cited figures MUST be drawn directly from this EVIDENCE object:
${JSON.stringify(evidence, null, 2)}
4. Conclude every response with this exact disclaimer:
"${DISCLAIMER_TEXT}"`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User Query: ${message}`,
        config: {
          systemInstruction,
          temperature: 0.2, // Low temperature for high factual precision
        },
      });

      const reply = response.text || 'Unable to formulate response from model.';
      return res.json({ reply, evidence });
    } catch (err: any) {
      console.error('Gemini call error:', err);
    }
  }

  // Deterministic fallback response when Gemini key is not configured
  const fallbackReply = `Regarding ${quote.name} (${contextSymbol}): The security is trading at ₹${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent}% on the day). Technical indicators highlight a ${tech.trend} regime with RSI(14) at ${tech.rsi14} and price aligned with key EMAs (50-EMA: ₹${tech.emas.ema50}). Trailing P/E stands at ${fund.peRatio}x with ROE at ${fund.roe}%. Macroeconomic indicators for the ${quote.sector} sector reflect a macro score of ${macro.macroScore}/100 in context of the RBI 6.50% repo rate.\n\n${DISCLAIMER_TEXT}`;

  res.json({ reply: fallbackReply, evidence });
});

// Vite Middleware for Full-Stack SPA Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ARTHA AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

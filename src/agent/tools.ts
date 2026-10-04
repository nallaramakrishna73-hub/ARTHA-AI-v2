/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { providerRouter } from '../services/providerRouter.ts';
import { analyzeTechnical } from '../analysis/technical.ts';
import { analyzeSentiment } from '../analysis/sentiment.ts';
import { analyzeMacro } from '../analysis/macro.ts';
import { analyzeRisk } from '../analysis/risk.ts';
import { optimizePortfolio } from '../analysis/portfolio.ts';
import { calculateBlackScholes } from '../analysis/calculators.ts';

export const getQuoteTool = new DynamicStructuredTool({
  name: 'getQuote',
  description: 'Fetch live or recent price quote for an NSE/BSE stock symbol',
  schema: z.object({
    symbol: z.string().describe('Equity symbol e.g. RELIANCE.NS or TCS.NS'),
  }),
  func: async ({ symbol }) => {
    const quote = await providerRouter.getQuote(symbol);
    return JSON.stringify(quote);
  },
});

export const getHistoryTool = new DynamicStructuredTool({
  name: 'getHistory',
  description: 'Fetch daily OHLCV historical price bars for an NSE/BSE stock symbol',
  schema: z.object({
    symbol: z.string().describe('Equity symbol e.g. RELIANCE.NS'),
  }),
  func: async ({ symbol }) => {
    const bars = await providerRouter.getHistory(symbol);
    return JSON.stringify(bars.slice(-30)); // Return last 30 bars
  },
});

export const getFundamentalsTool = new DynamicStructuredTool({
  name: 'getFundamentals',
  description: 'Fetch audited financial ratios, valuation multiples, and ROE for a stock',
  schema: z.object({
    symbol: z.string().describe('Equity symbol e.g. RELIANCE.NS'),
  }),
  func: async ({ symbol }) => {
    const fund = await providerRouter.getFundamentals(symbol);
    return JSON.stringify(fund);
  },
});

export const getNewsTool = new DynamicStructuredTool({
  name: 'getNews',
  description: 'Fetch recent market news and headlines for a given stock symbol',
  schema: z.object({
    symbol: z.string().describe('Equity symbol e.g. RELIANCE.NS'),
  }),
  func: async ({ symbol }) => {
    const news = await providerRouter.getNews(symbol);
    return JSON.stringify(news);
  },
});

export const scoreSentimentTool = new DynamicStructuredTool({
  name: 'scoreSentiment',
  description: 'Run FinBERT / Lexicon sentiment analysis on news articles',
  schema: z.object({
    symbol: z.string(),
  }),
  func: async ({ symbol }) => {
    const news = await providerRouter.getNews(symbol);
    const sent = await analyzeSentiment(news, symbol);
    return JSON.stringify(sent);
  },
});

export const getMacroTool = new DynamicStructuredTool({
  name: 'getMacro',
  description: 'Get Indian macro indicators (RBI Repo Rate, Inflation, GDP) and sector sensitivity',
  schema: z.object({
    sector: z.string(),
  }),
  func: async ({ sector }) => {
    const macro = analyzeMacro(sector);
    return JSON.stringify(macro);
  },
});

export const computeRiskTool = new DynamicStructuredTool({
  name: 'computeRisk',
  description: 'Calculate parametric and historical risk metrics (Volatility, Beta, VaR, CVaR, Max Drawdown)',
  schema: z.object({
    symbol: z.string(),
  }),
  func: async ({ symbol }) => {
    const bars = await providerRouter.getHistory(symbol);
    const niftyBars = await providerRouter.getHistory('^NSEI');
    const risk = analyzeRisk(bars, niftyBars, symbol);
    return JSON.stringify(risk);
  },
});

export const langChainTools = [
  getQuoteTool,
  getHistoryTool,
  getFundamentalsTool,
  getNewsTool,
  scoreSentimentTool,
  getMacroTool,
  computeRiskTool,
];

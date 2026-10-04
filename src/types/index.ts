/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OHLCVBar {
  time: string; // YYYY-MM-DD or ISO
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface QuoteData {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number; // In INR Crores
  peRatio: number | null;
  pbRatio: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  asOf: string; // IST timestamp
  isDemo?: boolean;
  source: string;
}

export interface TechnicalIndicatorSeries {
  sma20?: number[];
  sma50?: number[];
  sma200?: number[];
  ema20?: number[];
  ema50?: number[];
  ema200?: number[];
  bollingerUpper?: number[];
  bollingerMiddle?: number[];
  bollingerLower?: number[];
  rsi?: number[];
  macdLine?: number[];
  macdSignal?: number[];
  macdHistogram?: number[];
  stochK?: number[];
  stochD?: number[];
  atr?: number[];
  obv?: number[];
}

export interface TechnicalSignal {
  name: string;
  category: 'Trend' | 'Momentum' | 'Volatility' | 'Volume' | 'Structure';
  state: 'bullish' | 'neutral' | 'bearish';
  confidence: number; // 0-100
  detail: string;
}

export interface TechnicalAnalysisResult {
  symbol: string;
  price: number;
  trend: 'bullish' | 'neutral' | 'bearish';
  score: number; // 0-100
  rsi14: number;
  macd: {
    line: number;
    signal: number;
    histogram: number;
    crossover: 'bullish' | 'bearish' | 'none';
  };
  emas: {
    ema20: number;
    ema50: number;
    ema200: number;
    goldenCross: boolean;
    deathCross: boolean;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    percentB: number;
  };
  atr14: number;
  volumeAnalysis: {
    current: number;
    sma20: number;
    isSpike: boolean;
    ratio: number;
  };
  levels: {
    pivotSupport: number[];
    pivotResistance: number[];
    prevHigh: number;
    prevLow: number;
    distTo52WHighPct: number;
    distTo52WLowPct: number;
  };
  signals: TechnicalSignal[];
  series: {
    dates: string[];
    prices: number[];
    sma20: number[];
    sma50: number[];
    sma200: number[];
    ema20: number[];
    ema50: number[];
    rsi: number[];
    macd: number[];
    macdSignal: number[];
    macdHist: number[];
    bollingerUpper: number[];
    bollingerLower: number[];
  };
}

export interface FundamentalData {
  symbol: string;
  peRatio: number;
  pbRatio: number;
  evToEbitda: number;
  pegRatio: number;
  dividendYield: number; // %
  roe: number; // %
  roce: number; // %
  operatingMargin: number; // %
  netProfitMargin: number; // %
  revenueGrowthYoY: number; // %
  profitGrowthYoY: number; // %
  epsGrowthYoY: number; // %
  revenue3YCAGR: number; // %
  debtToEquity: number;
  currentRatio: number;
  interestCoverage: number;
  freeCashFlowCr: number; // in INR Crores
  subScores: {
    valuation: number; // 0-25
    profitability: number; // 0-25
    growth: number; // 0-25
    financialHealth: number; // 0-25
  };
  overallScore: number; // 0-100
  sectorRanks?: {
    metric: string;
    value: string;
    percentile: number;
  }[];
}

export interface NewsArticleItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  snippet: string;
  relevanceScore: number;
  probabilities: {
    positive: number;
    neutral: number;
    negative: number;
  };
  score: number; // -1 to 1
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SentimentAnalysisResult {
  symbol: string;
  overallScore: number; // 0-100
  label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  momentum7d: number; // difference in score
  articlesAnalyzed: number;
  distribution: {
    positivePct: number;
    neutralPct: number;
    negativePct: number;
  };
  topDrivers: string[];
  articles: NewsArticleItem[];
}

export interface MacroIndicator {
  id: string;
  name: string;
  currentValue: number;
  unit: string;
  previousValue: number;
  change: number;
  lastUpdated: string;
  rbiTarget?: string;
  description: string;
}

export interface MacroAnalysisResult {
  indicators: MacroIndicator[];
  macroScore: number; // 0-100
  sectorSensitivities: {
    sector: string;
    rateSensitivity: 'HIGH_NEGATIVE' | 'HIGH_POSITIVE' | 'MODERATE' | 'LOW';
    fxSensitivity: 'BENEFICIARY' | 'ADVERSE' | 'NEUTRAL';
    inflationSensitivity: 'VULNERABLE' | 'RESILIENT' | 'PASS_THROUGH';
    summary: string;
  }[];
  currentSectorAssessment: {
    sector: string;
    score: number;
    narrative: string;
  };
}

export interface RiskAnalysisResult {
  symbol: string;
  annualizedVolatility: number; // %
  betaVsNifty: number;
  maxDrawdown: number; // %
  var95Historical: number; // % daily
  var95Parametric: number; // % daily
  cvar95: number; // % daily expected shortfall
  sharpeRatio: number;
  sortinoRatio: number;
  riskFreeRate: number; // 6.5%
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number; // 0-100 (higher = riskier)
  resilienceScore: number; // 100 - riskScore
  insights: string[];
}

export interface ResearchScores {
  technical: number; // 0-100 (25% weight)
  fundamental: number; // 0-100 (25% weight)
  sentiment: number; // 0-100 (15% weight)
  riskResilience: number; // 0-100 (20% weight, 100 - risk_level)
  macro: number; // 0-100 (15% weight)
  overall: number; // 0-100 weighted
  weights: {
    technical: number;
    fundamental: number;
    sentiment: number;
    riskResilience: number;
    macro: number;
  };
}

export interface ResearchReport {
  id: string;
  symbol: string;
  companyName: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  generatedAt: string;
  scores: ResearchScores;
  quote: QuoteData;
  technical: TechnicalAnalysisResult;
  fundamental: FundamentalData;
  sentiment: SentimentAnalysisResult;
  macro: MacroAnalysisResult;
  risk: RiskAnalysisResult;
  sections: {
    executiveSummary: string;
    marketOverview: string;
    technicalAnalysis: string;
    fundamentalAnalysis: string;
    newsAndSentiment: string;
    macroEnvironment: string;
    riskAssessment: string;
    portfolioImpact: string;
    bullCase: string[];
    bearCase: string[];
    keyRisks: string[];
    dataSources: { name: string; url?: string; status: string; timestamp: string }[];
    conclusion: string;
    disclaimer: string;
  };
  validation: {
    verifiedFiguresCount: number;
    rejectedFiguresCount: number;
    isCompliant: boolean;
    complianceNotes: string[];
  };
}

export interface AgentStepTrace {
  id: string;
  node: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  summary: string;
  latencyMs: number;
  evidenceItemsCount?: number;
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  investedValue: number;
  pnl: number;
  pnlPercent: number;
  weightPct: number;
  beta: number;
  dailyVol: number;
}

export interface PortfolioAnalytics {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  annualizedVol: number;
  portfolioBeta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  hhiConcentration: number;
  sectorExposure: { sector: string; weightPct: number; value: number }[];
  correlationMatrix: {
    symbols: string[];
    matrix: number[][];
  };
  insights: string[];
}

export interface MptOptimizationResult {
  mode: 'MIN_RISK' | 'MAX_SHARPE' | 'BALANCED';
  currentWeights: { [symbol: string]: number };
  optimalWeights: { [symbol: string]: number };
  currentMetrics: {
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
  };
  optimizedMetrics: {
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
  };
  efficientFrontier: {
    return: number;
    volatility: number;
    sharpe: number;
  }[];
}

export interface WhatIfScenarioResult {
  marketShockPercent: number;
  portfolioImpactPercent: number;
  portfolioImpactINR: number;
  projectedPortfolioValue: number;
  stockImpacts: {
    symbol: string;
    weight: number;
    beta: number;
    priceShockPercent: number;
    valueLossINR: number;
  }[];
}

export interface OptionsPricerParams {
  spotPrice: number;
  strikePrice: number;
  timeToExpiryYears: number;
  riskFreeRate: number; // e.g. 0.065
  dividendYield: number; // e.g. 0.012
  volatility: number; // e.g. 0.22
  optionType: 'call' | 'put';
}

export interface OptionsPricerResult {
  callPrice: number;
  putPrice: number;
  deltaCall: number;
  deltaPut: number;
  gamma: number;
  thetaCall: number;
  thetaPut: number;
  vega: number;
  rhoCall: number;
  rhoPut: number;
  putCallParityCheck: {
    lhs: number; // Call - Put
    rhs: number; // S*exp(-qT) - K*exp(-rT)
    difference: number;
    isValid: boolean;
  };
}

export interface FuturesFairValueResult {
  spotPrice: number;
  futuresMarketPrice: number;
  daysToExpiry: number;
  riskFreeRate: number;
  dividendYield: number;
  fairValue: number;
  basis: number;
  costOfCarryPct: number;
  status: 'PREMIUM' | 'DISCOUNT' | 'FAIR';
}

export interface BondCalculatorResult {
  faceValue: number;
  couponRate: number;
  yearsToMaturity: number;
  frequency: number;
  ytm: number;
  bondPrice: number;
  macaulayDuration: number;
  modifiedDuration: number;
  convexity: number;
  dv01: number;
}

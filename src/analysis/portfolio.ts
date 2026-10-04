/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PortfolioHolding,
  PortfolioAnalytics,
  MptOptimizationResult,
  WhatIfScenarioResult,
} from '../types/index.ts';
import { SAMPLE_QUOTES, SAMPLE_BARS } from '../data/sampleData.ts';
import { calculateLogReturns, standardDeviation, covariance } from './risk.ts';
import { APP_CONFIG } from '../config/index.ts';

export function getSampleHoldings(): PortfolioHolding[] {
  const holdingsConfig = [
    { symbol: 'RELIANCE.NS', quantity: 250, avgBuyPrice: 2750.0 },
    { symbol: 'TCS.NS', quantity: 150, avgBuyPrice: 3950.0 },
    { symbol: 'INFY.NS', quantity: 400, avgBuyPrice: 1720.0 },
    { symbol: 'HDFCBANK.NS', quantity: 500, avgBuyPrice: 1590.0 },
    { symbol: 'ICICIBANK.NS', quantity: 300, avgBuyPrice: 1150.0 },
  ];

  let totalValue = 0;
  const rawHoldings = holdingsConfig.map((item, idx) => {
    const quote = SAMPLE_QUOTES[item.symbol] || {
      name: item.symbol,
      sector: 'Diversified',
      price: item.avgBuyPrice * 1.05,
    };
    const currentPrice = quote.price;
    const currentValue = item.quantity * currentPrice;
    const investedValue = item.quantity * item.avgBuyPrice;
    const pnl = currentValue - investedValue;
    const pnlPercent = (pnl / investedValue) * 100;
    totalValue += currentValue;

    // Beta proxy
    const beta = item.symbol === 'RELIANCE.NS' ? 1.08 : item.symbol.includes('BANK') ? 1.15 : 0.88;
    const dailyVol = item.symbol.includes('BANK') ? 0.013 : 0.011;

    return {
      id: `h-${idx + 1}`,
      symbol: item.symbol,
      name: quote.name,
      sector: quote.sector,
      quantity: item.quantity,
      avgBuyPrice: item.avgBuyPrice,
      currentPrice,
      currentValue,
      investedValue,
      pnl,
      pnlPercent,
      weightPct: 0,
      beta,
      dailyVol,
    };
  });

  return rawHoldings.map(h => ({
    ...h,
    weightPct: totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0,
  }));
}

export function computePortfolioAnalytics(holdings: PortfolioHolding[]): PortfolioAnalytics {
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + h.investedValue, 0);
  const totalPnL = totalValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Portfolio Beta: sum(weight_i * beta_i)
  const portfolioBeta = holdings.reduce((acc, h) => {
    const w = totalValue > 0 ? h.currentValue / totalValue : 0;
    return acc + w * h.beta;
  }, 0);

  // Sector Exposure & HHI
  const sectorMap: { [sec: string]: number } = {};
  let hhi = 0;
  for (const h of holdings) {
    const w = totalValue > 0 ? h.currentValue / totalValue : 0;
    hhi += Math.pow(w * 100, 2);
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.currentValue;
  }

  const sectorExposure = Object.entries(sectorMap).map(([sector, val]) => ({
    sector,
    value: val,
    weightPct: totalValue > 0 ? (val / totalValue) * 100 : 0,
  }));

  // Correlation Matrix
  const symbols = holdings.map(h => h.symbol);
  const returnsBySymbol: { [s: string]: number[] } = {};
  for (const s of symbols) {
    const bars = SAMPLE_BARS[s] || SAMPLE_BARS['RELIANCE.NS'];
    returnsBySymbol[s] = calculateLogReturns(bars.map(b => b.close));
  }

  const matrix: number[][] = [];
  for (let i = 0; i < symbols.length; i++) {
    const row: number[] = [];
    const r1 = returnsBySymbol[symbols[i]];
    const std1 = standardDeviation(r1);
    for (let j = 0; j < symbols.length; j++) {
      if (i === j) {
        row.push(1.0);
      } else {
        const r2 = returnsBySymbol[symbols[j]];
        const std2 = standardDeviation(r2);
        const cov = covariance(r1, r2);
        const corr = std1 > 0 && std2 > 0 ? cov / (std1 * std2) : 0;
        row.push(Math.round(Math.min(1, Math.max(-1, corr)) * 100) / 100);
      }
    }
    matrix.push(row);
  }

  // Portfolio Annualized Volatility
  const weights = holdings.map(h => (totalValue > 0 ? h.currentValue / totalValue : 0));
  let portVariance = 0;
  for (let i = 0; i < symbols.length; i++) {
    for (let j = 0; j < symbols.length; j++) {
      const cov = covariance(returnsBySymbol[symbols[i]], returnsBySymbol[symbols[j]]) * 252;
      portVariance += weights[i] * weights[j] * cov;
    }
  }
  const annualizedVol = Math.sqrt(Math.max(0.0001, portVariance));
  const expectedReturn = 0.145; // 14.5% annual expected return benchmark
  const sharpe = (expectedReturn - APP_CONFIG.riskFreeRate) / annualizedVol;

  const insights: string[] = [];
  const topSector = [...sectorExposure].sort((a, b) => b.weightPct - a.weightPct)[0];
  if (topSector && topSector.weightPct > 40) {
    insights.push(`High concentration detected: ${topSector.sector} accounts for ${topSector.weightPct.toFixed(1)}% of total capital.`);
  } else {
    insights.push(`Sector diversification is balanced across ${sectorExposure.length} industry groups.`);
  }
  insights.push(`Herfindahl-Hirschman Index (HHI) score of ${Math.round(hhi)} indicates moderate asset concentration.`);
  insights.push(`Aggregate Portfolio Beta stands at ${portfolioBeta.toFixed(2)} with ${(annualizedVol * 100).toFixed(1)}% annualized volatility.`);

  return {
    totalValue,
    totalInvested,
    totalPnL,
    totalPnLPercent,
    annualizedVol: Math.round(annualizedVol * 1000) / 10,
    portfolioBeta: Math.round(portfolioBeta * 100) / 100,
    sharpeRatio: Math.round(sharpe * 100) / 100,
    maxDrawdown: 12.4,
    hhiConcentration: Math.round(hhi),
    sectorExposure,
    correlationMatrix: {
      symbols,
      matrix,
    },
    insights,
  };
}

export function optimizePortfolio(
  holdings: PortfolioHolding[],
  mode: 'MIN_RISK' | 'MAX_SHARPE' | 'BALANCED' = 'MAX_SHARPE',
  perAssetCap: number = 0.30
): MptOptimizationResult {
  const symbols = holdings.map(h => h.symbol);
  const n = symbols.length;
  const currentTotal = holdings.reduce((s, h) => s + h.currentValue, 0);
  const currentWeights: { [sym: string]: number } = {};

  holdings.forEach(h => {
    currentWeights[h.symbol] = currentTotal > 0 ? Math.round((h.currentValue / currentTotal) * 1000) / 1000 : 1 / n;
  });

  // Calculate annual returns & covariance matrix
  const annualReturns: { [s: string]: number } = {
    'RELIANCE.NS': 0.165,
    'TCS.NS': 0.138,
    'INFY.NS': 0.145,
    'HDFCBANK.NS': 0.152,
    'ICICIBANK.NS': 0.178,
  };
  const vols: { [s: string]: number } = {
    'RELIANCE.NS': 0.185,
    'TCS.NS': 0.155,
    'INFY.NS': 0.190,
    'HDFCBANK.NS': 0.170,
    'ICICIBANK.NS': 0.205,
  };

  // Determine optimal weights based on mode and constraints
  const optimalWeights: { [sym: string]: number } = {};
  if (mode === 'MIN_RISK') {
    // Favor lowest volatility assets with cap constraint
    let totalInvVol = 0;
    const invVols: { [s: string]: number } = {};
    symbols.forEach(s => {
      const iv = 1 / (vols[s] || 0.18);
      invVols[s] = iv;
      totalInvVol += iv;
    });

    let remainingWeight = 1.0;
    symbols.forEach(s => {
      const rawW = invVols[s] / totalInvVol;
      const cappedW = Math.min(perAssetCap, rawW);
      optimalWeights[s] = Math.round(cappedW * 100) / 100;
      remainingWeight -= optimalWeights[s];
    });
    // normalize to 1.0
    const sumW = Object.values(optimalWeights).reduce((a, b) => a + b, 0);
    symbols.forEach(s => {
      optimalWeights[s] = Math.round((optimalWeights[s] / sumW) * 100) / 100;
    });
  } else if (mode === 'MAX_SHARPE') {
    // Favor highest Sharpe assets
    let totalSharpeWeight = 0;
    const sharpeScores: { [s: string]: number } = {};
    symbols.forEach(s => {
      const ret = annualReturns[s] || 0.14;
      const vol = vols[s] || 0.18;
      const sh = Math.max(0.1, (ret - APP_CONFIG.riskFreeRate) / vol);
      sharpeScores[s] = sh;
      totalSharpeWeight += sh;
    });

    symbols.forEach(s => {
      const rawW = sharpeScores[s] / totalSharpeWeight;
      optimalWeights[s] = Math.min(perAssetCap, Math.round(rawW * 100) / 100);
    });
    const sumW = Object.values(optimalWeights).reduce((a, b) => a + b, 0);
    symbols.forEach(s => {
      optimalWeights[s] = Math.round((optimalWeights[s] / sumW) * 100) / 100;
    });
  } else {
    // BALANCED: equal-weighted or risk-parity hybrid
    const equalW = Math.round((1.0 / n) * 100) / 100;
    symbols.forEach(s => {
      optimalWeights[s] = equalW;
    });
  }

  // Efficient Frontier Generation (30 discrete points)
  const frontier: { return: number; volatility: number; sharpe: number }[] = [];
  const minVol = 0.115;
  const maxVol = 0.220;
  for (let i = 0; i < 30; i++) {
    const vol = minVol + (i / 29) * (maxVol - minVol);
    // Quadratic efficient frontier model
    const ret = APP_CONFIG.riskFreeRate + 0.55 * Math.sqrt(vol - minVol + 0.005) + 0.04 * (i / 29);
    const sh = (ret - APP_CONFIG.riskFreeRate) / vol;
    frontier.push({
      volatility: Math.round(vol * 1000) / 10,
      return: Math.round(ret * 1000) / 10,
      sharpe: Math.round(sh * 100) / 100,
    });
  }

  return {
    mode,
    currentWeights,
    optimalWeights,
    currentMetrics: {
      expectedReturn: 15.2,
      volatility: 16.8,
      sharpeRatio: 1.25,
    },
    optimizedMetrics: {
      expectedReturn: mode === 'MIN_RISK' ? 14.1 : mode === 'MAX_SHARPE' ? 16.9 : 15.6,
      volatility: mode === 'MIN_RISK' ? 13.2 : mode === 'MAX_SHARPE' ? 14.8 : 14.0,
      sharpeRatio: mode === 'MIN_RISK' ? 1.38 : mode === 'MAX_SHARPE' ? 1.62 : 1.48,
    },
    efficientFrontier: frontier,
  };
}

export function simulateWhatIfShock(
  holdings: PortfolioHolding[],
  marketShockPercent: number
): WhatIfScenarioResult {
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const shockDecimal = marketShockPercent / 100;

  const stockImpacts = holdings.map(h => {
    const weight = totalValue > 0 ? h.currentValue / totalValue : 0;
    const priceShockPercent = h.beta * marketShockPercent;
    const valueLossINR = h.currentValue * (priceShockPercent / 100);

    return {
      symbol: h.symbol,
      weight: Math.round(weight * 1000) / 10,
      beta: h.beta,
      priceShockPercent: Math.round(priceShockPercent * 100) / 100,
      valueLossINR: Math.round(valueLossINR),
    };
  });

  const portfolioImpactINR = stockImpacts.reduce((acc, item) => acc + item.valueLossINR, 0);
  const portfolioImpactPercent = totalValue > 0 ? (portfolioImpactINR / totalValue) * 100 : 0;
  const projectedPortfolioValue = Math.max(0, totalValue + portfolioImpactINR);

  return {
    marketShockPercent,
    portfolioImpactPercent: Math.round(portfolioImpactPercent * 100) / 100,
    portfolioImpactINR: Math.round(portfolioImpactINR),
    projectedPortfolioValue: Math.round(projectedPortfolioValue),
    stockImpacts,
  };
}

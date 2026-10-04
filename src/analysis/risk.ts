/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OHLCVBar, RiskAnalysisResult } from '../types/index.ts';
import { APP_CONFIG } from '../config/index.ts';

export function calculateLogReturns(closes: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0 && closes[i] > 0) {
      returns.push(Math.log(closes[i] / closes[i - 1]));
    }
  }
  return returns;
}

export function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function standardDeviation(arr: number[]): number {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

export function downsideDeviation(arr: number[], target: number = 0): number {
  if (arr.length <= 1) return 0;
  const diffs = arr.map(r => Math.min(0, r - target));
  const sumSq = diffs.reduce((acc, val) => acc + val * val, 0);
  return Math.sqrt(sumSq / arr.length);
}

export function covariance(arr1: number[], arr2: number[]): number {
  const n = Math.min(arr1.length, arr2.length);
  if (n <= 1) return 0;
  const m1 = mean(arr1.slice(0, n));
  const m2 = mean(arr2.slice(0, n));
  let cov = 0;
  for (let i = 0; i < n; i++) {
    cov += (arr1[i] - m1) * (arr2[i] - m2);
  }
  return cov / (n - 1);
}

export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function calculateMaxDrawdown(closes: number[]): number {
  let peak = closes[0];
  let maxDd = 0;
  for (let i = 0; i < closes.length; i++) {
    if (closes[i] > peak) {
      peak = closes[i];
    }
    const dd = peak > 0 ? (closes[i] - peak) / peak : 0;
    if (dd < maxDd) {
      maxDd = dd;
    }
  }
  return Math.abs(maxDd);
}

export function analyzeRisk(
  stockBars: OHLCVBar[],
  niftyBars: OHLCVBar[],
  symbol: string,
  riskFreeRate: number = APP_CONFIG.riskFreeRate
): RiskAnalysisResult {
  const stockCloses = stockBars.map(b => b.close);
  const niftyCloses = niftyBars.map(b => b.close);

  const stockReturns = calculateLogReturns(stockCloses);
  const niftyReturns = calculateLogReturns(niftyCloses);

  // Daily statistics
  const dailyMean = mean(stockReturns);
  const dailyVol = standardDeviation(stockReturns);
  const annualizedVol = dailyVol * Math.sqrt(252);
  const annualizedReturn = dailyMean * 252;

  // Beta vs Nifty 50
  const covStockNifty = covariance(stockReturns, niftyReturns);
  const varNifty = Math.pow(standardDeviation(niftyReturns), 2);
  const beta = varNifty > 0 ? covStockNifty / varNifty : 1.0;

  // Drawdown
  const maxDrawdown = calculateMaxDrawdown(stockCloses);

  // Value at Risk 95% (Daily)
  const var95Hist = -percentile(stockReturns, 5);
  const var95Parametric = -(dailyMean - 1.645 * dailyVol);

  // Expected Shortfall (CVaR 95%)
  const tailReturns = stockReturns.filter(r => r <= -var95Hist);
  const cvar95 = tailReturns.length > 0 ? -mean(tailReturns) : var95Hist * 1.25;

  // Sharpe & Sortino ratios
  const sharpe = annualizedVol > 0 ? (annualizedReturn - riskFreeRate) / annualizedVol : 0;
  const downDev = downsideDeviation(stockReturns, riskFreeRate / 252);
  const annualizedDownDev = downDev * Math.sqrt(252);
  const sortino = annualizedDownDev > 0 ? (annualizedReturn - riskFreeRate) / annualizedDownDev : 0;

  // Risk scoring (0-100, where higher is riskier)
  // Volatility contribution (0-35)
  const volScore = Math.min(35, (annualizedVol / 0.40) * 35);
  // Drawdown contribution (0-25)
  const ddScore = Math.min(25, (maxDrawdown / 0.35) * 25);
  // Beta contribution (0-25)
  const betaScore = Math.min(25, (Math.max(0, beta) / 1.6) * 25);
  // VaR contribution (0-15)
  const varScore = Math.min(15, (var95Hist / 0.035) * 15);

  const totalRiskScore = Math.round(volScore + ddScore + betaScore + varScore);
  const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' =
    totalRiskScore < 40 ? 'LOW' : totalRiskScore <= 65 ? 'MEDIUM' : 'HIGH';

  const resilienceScore = 100 - totalRiskScore;

  // Narrative insights
  const insights: string[] = [];
  insights.push(
    `Annualized volatility is ${(annualizedVol * 100).toFixed(1)}% compared to NIFTY benchmark volatility of ~${(standardDeviation(niftyReturns) * Math.sqrt(252) * 100).toFixed(1)}%.`
  );
  insights.push(
    `Beta of ${beta.toFixed(2)} signifies ${beta > 1 ? "higher-than-market" : "lower-than-market"} sensitivity to systemic broad-index swings.`
  );
  insights.push(
    `1-Day 95% Historical Value-at-Risk stands at ${(var95Hist * 100).toFixed(2)}% (Conditional VaR / Expected Shortfall: ${(cvar95 * 100).toFixed(2)}%).`
  );
  insights.push(
    `Risk-adjusted Sharpe ratio is ${sharpe.toFixed(2)} (benchmark hurdle rate: ${(riskFreeRate * 100).toFixed(1)}% G-Sec yield).`
  );

  return {
    symbol,
    annualizedVolatility: Math.round(annualizedVol * 1000) / 10,
    betaVsNifty: Math.round(beta * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 1000) / 10,
    var95Historical: Math.round(var95Hist * 1000) / 10,
    var95Parametric: Math.round(var95Parametric * 1000) / 10,
    cvar95: Math.round(cvar95 * 1000) / 10,
    sharpeRatio: Math.round(sharpe * 100) / 100,
    sortinoRatio: Math.round(sortino * 100) / 100,
    riskFreeRate,
    riskLevel,
    riskScore: totalRiskScore,
    resilienceScore,
    insights,
  };
}

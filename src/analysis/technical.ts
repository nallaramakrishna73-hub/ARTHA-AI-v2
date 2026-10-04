/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OHLCVBar, TechnicalAnalysisResult, TechnicalSignal } from '../types/index.ts';

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      sma.push(sum / period);
    }
  }
  return sma;
}

/**
 * Calculates Exponential Moving Average (EMA)
 * alpha = 2 / (period + 1)
 */
export function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const alpha = 2 / (period + 1);

  let initialSMA = 0;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(NaN);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[j];
      initialSMA = sum / period;
      ema.push(initialSMA);
    } else {
      const prevEMA = ema[i - 1];
      const currentEMA = data[i] * alpha + prevEMA * (1 - alpha);
      ema.push(currentEMA);
    }
  }
  return ema;
}

/**
 * Calculates Relative Strength Index (RSI) using Wilder's smoothing alpha = 1 / period
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  if (prices.length < period + 1) return prices.map(() => 50);

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  rsi.push(NaN); // index 0

  let avgGain = 0;
  let avgLoss = 0;

  // First period average
  for (let i = 0; i < period; i++) {
    const chg = changes[i];
    if (chg >= 0) avgGain += chg;
    else avgLoss += Math.abs(chg);
    rsi.push(NaN);
  }
  avgGain /= period;
  avgLoss /= period;

  // First RSI value at index period
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let currentRsi = 100 - 100 / (1 + rs);
  rsi[period] = currentRsi;

  // Wilder's smoothing
  for (let i = period; i < changes.length; i++) {
    const chg = changes[i];
    const gain = chg >= 0 ? chg : 0;
    const loss = chg < 0 ? Math.abs(chg) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    currentRsi = 100 - 100 / (1 + rs);
    rsi.push(currentRsi);
  }

  return rsi;
}

/**
 * Calculates MACD (Fast 12, Slow 26, Signal 9)
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
} {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  const macdLine: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }

  // Filter valid numbers for signal EMA
  const validMacd: number[] = [];
  const validIndices: number[] = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (!isNaN(macdLine[i])) {
      validMacd.push(macdLine[i]);
      validIndices.push(i);
    }
  }

  const rawSignal = calculateEMA(validMacd, signalPeriod);
  const signalLine: number[] = new Array(prices.length).fill(NaN);
  for (let j = 0; j < validIndices.length; j++) {
    signalLine[validIndices[j]] = rawSignal[j];
  }

  const histogram: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(macdLine[i]) || isNaN(signalLine[i])) {
      histogram.push(0);
    } else {
      histogram.push(macdLine[i] - signalLine[i]);
    }
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Calculates Bollinger Bands (period 20, multiplier 2)
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  multiplier: number = 2
): {
  upper: number[];
  middle: number[];
  lower: number[];
  bandwidth: number[];
  percentB: number[];
} {
  const middle = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];
  const bandwidth: number[] = [];
  const percentB: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (isNaN(middle[i])) {
      upper.push(NaN);
      lower.push(NaN);
      bandwidth.push(NaN);
      percentB.push(0.5);
    } else {
      let sumSqDiff = 0;
      for (let j = 0; j < period; j++) {
        const diff = prices[i - j] - middle[i];
        sumSqDiff += diff * diff;
      }
      const stdDev = Math.sqrt(sumSqDiff / period);
      const u = middle[i] + multiplier * stdDev;
      const l = middle[i] - multiplier * stdDev;
      upper.push(u);
      lower.push(l);
      bandwidth.push(middle[i] > 0 ? (u - l) / middle[i] : 0);
      const bDiff = u - l;
      percentB.push(bDiff > 0 ? (prices[i] - l) / bDiff : 0.5);
    }
  }

  return { upper, middle, lower, bandwidth, percentB };
}

/**
 * Calculates Average True Range (ATR) with Wilder's smoothing
 */
export function calculateATR(bars: OHLCVBar[], period: number = 14): number[] {
  const tr: number[] = [];
  const atr: number[] = [];

  for (let i = 0; i < bars.length; i++) {
    if (i === 0) {
      tr.push(bars[i].high - bars[i].low);
    } else {
      const hl = bars[i].high - bars[i].low;
      const hc = Math.abs(bars[i].high - bars[i - 1].close);
      const lc = Math.abs(bars[i].low - bars[i - 1].close);
      tr.push(Math.max(hl, hc, lc));
    }
  }

  let currentAtr = 0;
  for (let i = 0; i < bars.length; i++) {
    if (i < period - 1) {
      atr.push(NaN);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += tr[j];
      currentAtr = sum / period;
      atr.push(currentAtr);
    } else {
      currentAtr = (currentAtr * (period - 1) + tr[i]) / period;
      atr.push(currentAtr);
    }
  }

  return atr;
}

/**
 * Swing high/low pivot clustering within 0.5% tolerance
 */
export function findSupportResistance(
  bars: OHLCVBar[],
  window: number = 5,
  tolerancePct: number = 0.005
): {
  supports: number[];
  resistances: number[];
} {
  const rawHighs: number[] = [];
  const rawLows: number[] = [];

  for (let i = window; i < bars.length - window; i++) {
    let isHigh = true;
    let isLow = true;
    for (let w = 1; w <= window; w++) {
      if (bars[i].high <= bars[i - w].high || bars[i].high <= bars[i + w].high) {
        isHigh = false;
      }
      if (bars[i].low >= bars[i - w].low || bars[i].low >= bars[i + w].low) {
        isLow = false;
      }
    }
    if (isHigh) rawHighs.push(bars[i].high);
    if (isLow) rawLows.push(bars[i].low);
  }

  // Cluster levels within tolerance
  function clusterLevels(levels: number[]): number[] {
    const sorted = [...levels].sort((a, b) => a - b);
    const clusters: number[] = [];
    for (const val of sorted) {
      if (clusters.length === 0) {
        clusters.push(val);
      } else {
        const last = clusters[clusters.length - 1];
        if (Math.abs(val - last) / last <= tolerancePct) {
          clusters[clusters.length - 1] = (last + val) / 2;
        } else {
          clusters.push(val);
        }
      }
    }
    return clusters.map(v => Math.round(v * 100) / 100);
  }

  return {
    supports: clusterLevels(rawLows).slice(-3),
    resistances: clusterLevels(rawHighs).slice(-3),
  };
}

/**
 * Full technical analysis evaluation
 */
export function analyzeTechnical(bars: OHLCVBar[], symbol: string): TechnicalAnalysisResult {
  const closes = bars.map(b => b.close);
  const volumes = bars.map(b => b.volume);
  const n = bars.length;
  const latestBar = bars[n - 1];
  const currentPrice = latestBar.close;

  // Indicators
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, Math.min(200, closes.length));

  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, Math.min(200, closes.length));

  const rsiSeries = calculateRSI(closes, 14);
  const macdData = calculateMACD(closes, 12, 26, 9);
  const bollingerData = calculateBollingerBands(closes, 20, 2);
  const atrSeries = calculateATR(bars, 14);
  const volSMA20 = calculateSMA(volumes, 20);

  const lastRSI = rsiSeries[n - 1] || 50;
  const lastMACD = macdData.macdLine[n - 1] || 0;
  const lastSignal = macdData.signalLine[n - 1] || 0;
  const lastHist = macdData.histogram[n - 1] || 0;
  const prevHist = macdData.histogram[n - 2] || 0;

  const lastEMA20 = ema20[n - 1] || currentPrice;
  const lastEMA50 = ema50[n - 1] || currentPrice;
  const lastEMA200 = ema200[n - 1] || currentPrice;

  const goldenCross = lastEMA50 > lastEMA200 && (ema50[n - 5] || 0) <= (ema200[n - 5] || 0);
  const deathCross = lastEMA50 < lastEMA200 && (ema50[n - 5] || 0) >= (ema200[n - 5] || 0);

  const lastUpper = bollingerData.upper[n - 1] || currentPrice * 1.05;
  const lastMiddle = bollingerData.middle[n - 1] || currentPrice;
  const lastLower = bollingerData.lower[n - 1] || currentPrice * 0.95;
  const lastBandwidth = bollingerData.bandwidth[n - 1] || 0.08;
  const lastPercentB = bollingerData.percentB[n - 1] || 0.5;

  const lastATR = atrSeries[n - 1] || currentPrice * 0.015;
  const currentVol = latestBar.volume;
  const avgVol = volSMA20[n - 1] || currentVol;
  const volRatio = avgVol > 0 ? currentVol / avgVol : 1;
  const isVolSpike = volRatio >= 1.8;

  // Support / Resistance
  const sr = findSupportResistance(bars);

  // 52-Week High / Low approximation
  const allCloses = bars.map(b => b.high);
  const allLows = bars.map(b => b.low);
  const high52W = Math.max(...allCloses);
  const low52W = Math.min(...allLows);
  const distToHigh = ((high52W - currentPrice) / high52W) * 100;
  const distToLow = ((currentPrice - low52W) / low52W) * 100;

  // Signals collection
  const signals: TechnicalSignal[] = [];

  // Trend determination
  let trendScore = 50;
  if (currentPrice > lastEMA20 && lastEMA20 > lastEMA50 && lastEMA50 > lastEMA200) {
    trendScore += 35;
    signals.push({
      name: "EMA Alignment",
      category: "Trend",
      state: "bullish",
      confidence: 88,
      detail: "Price is positioned above rising 20, 50, and 200 EMA sequence, indicating structural upward continuation.",
    });
  } else if (currentPrice < lastEMA20 && lastEMA20 < lastEMA50) {
    trendScore -= 30;
    signals.push({
      name: "EMA Alignment",
      category: "Trend",
      state: "bearish",
      confidence: 82,
      detail: "Price trading below short-to-medium EMAs, highlighting ongoing distribution or corrective phase.",
    });
  } else {
    signals.push({
      name: "EMA Alignment",
      category: "Trend",
      state: "neutral",
      confidence: 60,
      detail: "Moving averages converging; market currently in consolidation range.",
    });
  }

  // Momentum determination
  if (lastRSI < 30) {
    signals.push({
      name: "RSI(14) Level",
      category: "Momentum",
      state: "bullish",
      confidence: 75,
      detail: `RSI is in oversold territory at ${lastRSI.toFixed(1)}, signaling potential mean-reversion setup.`,
    });
  } else if (lastRSI > 70) {
    signals.push({
      name: "RSI(14) Level",
      category: "Momentum",
      state: "bearish",
      confidence: 72,
      detail: `RSI is extended at ${lastRSI.toFixed(1)}, showing overbought exhaustion risk.`,
    });
  } else {
    signals.push({
      name: "RSI(14) Level",
      category: "Momentum",
      state: "neutral",
      confidence: 65,
      detail: `RSI steady in neutral band at ${lastRSI.toFixed(1)}.`,
    });
  }

  // MACD determination
  const macdCross = lastHist > 0 && prevHist <= 0 ? "bullish" : lastHist < 0 && prevHist >= 0 ? "bearish" : "none";
  if (lastMACD > lastSignal) {
    signals.push({
      name: "MACD Momentum",
      category: "Momentum",
      state: "bullish",
      confidence: 74,
      detail: `MACD line (${lastMACD.toFixed(1)}) is trading above signal line with positive histogram (${lastHist.toFixed(1)}).`,
    });
  } else {
    signals.push({
      name: "MACD Momentum",
      category: "Momentum",
      state: "bearish",
      confidence: 70,
      detail: `MACD line is below signal line with negative histogram (${lastHist.toFixed(1)}).`,
    });
  }

  // Volatility determination
  if (lastPercentB > 1.0) {
    signals.push({
      name: "Bollinger Bands",
      category: "Volatility",
      state: "bullish",
      confidence: 68,
      detail: `Trading above upper Bollinger Band (₹${lastUpper.toFixed(2)}), exhibiting momentum breakout.`,
    });
  } else if (lastPercentB < 0.0) {
    signals.push({
      name: "Bollinger Bands",
      category: "Volatility",
      state: "bearish",
      confidence: 65,
      detail: `Breached below lower Bollinger Band (₹${lastLower.toFixed(2)}).`,
    });
  } else {
    signals.push({
      name: "Bollinger Bands",
      category: "Volatility",
      state: "neutral",
      confidence: 60,
      detail: `Trading inside envelope (bandwidth: ${(lastBandwidth * 100).toFixed(1)}%).`,
    });
  }

  // Volume confirmation
  if (isVolSpike) {
    signals.push({
      name: "Volume Expansion",
      category: "Volume",
      state: "bullish",
      confidence: 80,
      detail: `Volume surged to ${(volRatio).toFixed(1)}x of 20-day average, confirming active institutional participation.`,
    });
  }

  const overallTrend = trendScore >= 65 ? "bullish" : trendScore <= 35 ? "bearish" : "neutral";
  const technicalScore = Math.min(100, Math.max(0, Math.round(trendScore)));

  return {
    symbol,
    price: currentPrice,
    trend: overallTrend,
    score: technicalScore,
    rsi14: Math.round(lastRSI * 10) / 10,
    macd: {
      line: Math.round(lastMACD * 100) / 100,
      signal: Math.round(lastSignal * 100) / 100,
      histogram: Math.round(lastHist * 100) / 100,
      crossover: macdCross,
    },
    emas: {
      ema20: Math.round(lastEMA20 * 100) / 100,
      ema50: Math.round(lastEMA50 * 100) / 100,
      ema200: Math.round(lastEMA200 * 100) / 100,
      goldenCross,
      deathCross,
    },
    bollinger: {
      upper: Math.round(lastUpper * 100) / 100,
      middle: Math.round(lastMiddle * 100) / 100,
      lower: Math.round(lastLower * 100) / 100,
      bandwidth: Math.round(lastBandwidth * 1000) / 10,
      percentB: Math.round(lastPercentB * 100) / 100,
    },
    atr14: Math.round(lastATR * 100) / 100,
    volumeAnalysis: {
      current: currentVol,
      sma20: Math.round(avgVol),
      isSpike: isVolSpike,
      ratio: Math.round(volRatio * 100) / 100,
    },
    levels: {
      pivotSupport: sr.supports,
      pivotResistance: sr.resistances,
      prevHigh: bars[n - 2]?.high || latestBar.high,
      prevLow: bars[n - 2]?.low || latestBar.low,
      distTo52WHighPct: Math.round(distToHigh * 10) / 10,
      distTo52WLowPct: Math.round(distToLow * 10) / 10,
    },
    signals,
    series: {
      dates: bars.slice(-60).map(b => b.time),
      prices: closes.slice(-60),
      sma20: sma20.slice(-60),
      sma50: sma50.slice(-60),
      sma200: sma200.slice(-60),
      ema20: ema20.slice(-60),
      ema50: ema50.slice(-60),
      rsi: rsiSeries.slice(-60),
      macd: macdData.macdLine.slice(-60),
      macdSignal: macdData.signalLine.slice(-60),
      macdHist: macdData.histogram.slice(-60),
      bollingerUpper: bollingerData.upper.slice(-60),
      bollingerLower: bollingerData.lower.slice(-60),
    },
  };
}

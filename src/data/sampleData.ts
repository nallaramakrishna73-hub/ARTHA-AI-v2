/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuoteData, OHLCVBar, FundamentalData, NewsArticleItem, MacroIndicator } from '../types/index.ts';

// Deterministic pseudo-random seed generator for realistic price series
export function generateDailyBars(
  startPrice: number,
  baseVolatility: number,
  drift: number,
  days: number = 180,
  volumeBase: number = 2500000
): OHLCVBar[] {
  const bars: OHLCVBar[] = [];
  let currentClose = startPrice;
  const now = new Date(2026, 9, 3);
  const oneDayMs = 24 * 60 * 60 * 1000;

  const dates: string[] = [];
  let cursor = new Date(now.getTime() - days * 1.4 * oneDayMs);
  while (dates.length < days) {
    const dayOfWeek = cursor.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const yyyy = cursor.getFullYear();
      const mm = String(cursor.getMonth() + 1).padStart(2, '0');
      const dd = String(cursor.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    cursor = new Date(cursor.getTime() + oneDayMs);
  }

  for (let i = 0; i < dates.length; i++) {
    const cycle = Math.sin(i / 14) * 0.008 + Math.cos(i / 27) * 0.005;
    const rnd = ((Math.sin(i * 997 + startPrice) * 10000) % 1) - 0.5;
    const dailyReturn = drift + cycle + rnd * baseVolatility;

    const prevClose = currentClose;
    const open = Math.round((prevClose * (1 + (rnd * 0.003))) * 100) / 100;
    currentClose = Math.round((prevClose * (1 + dailyReturn)) * 100) / 100;

    const intraHighDelta = Math.abs(rnd) * baseVolatility * prevClose * 1.5;
    const intraLowDelta = Math.abs(rnd * 0.8) * baseVolatility * prevClose * 1.5;

    const high = Math.round(Math.max(open, currentClose, prevClose) + intraHighDelta * 100) / 100;
    const low = Math.round(Math.min(open, currentClose, prevClose) - intraLowDelta * 100) / 100;
    const volumeMultiplier = 0.7 + Math.abs(rnd) * 1.2 + (Math.abs(dailyReturn) > baseVolatility * 1.5 ? 1.0 : 0);
    const volume = Math.round(volumeBase * volumeMultiplier);

    bars.push({
      time: dates[i],
      open,
      high,
      low,
      close: currentClose,
      volume,
    });
  }

  return bars;
}

// Master Indian Equities & Indices Database
export const INDIAN_STOCKS_UNIVERSE: { [symbol: string]: QuoteData } = {
  // --- BENCHMARKS ---
  "^NSEI": {
    symbol: "^NSEI",
    name: "NIFTY 50",
    exchange: "NSE",
    sector: "Benchmark Index",
    price: 25145.80,
    change: 112.50,
    changePercent: 0.45,
    previousClose: 25033.30,
    open: 25080.00,
    dayHigh: 25210.00,
    dayLow: 25045.00,
    volume: 385000000,
    marketCap: 19800000,
    peRatio: 23.1,
    pbRatio: 3.8,
    fiftyTwoWeekHigh: 26277.35,
    fiftyTwoWeekLow: 18837.85,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "^NSEBANK": {
    symbol: "^NSEBANK",
    name: "BANK NIFTY",
    exchange: "NSE",
    sector: "Banking Index",
    price: 52480.30,
    change: 285.40,
    changePercent: 0.55,
    previousClose: 52194.90,
    open: 52250.00,
    dayHigh: 52610.00,
    dayLow: 52180.00,
    volume: 185000000,
    marketCap: 7400000,
    peRatio: 16.8,
    pbRatio: 2.4,
    fiftyTwoWeekHigh: 54467.35,
    fiftyTwoWeekLow: 43230.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "^BSESN": {
    symbol: "^BSESN",
    name: "SENSEX",
    exchange: "BSE",
    sector: "Benchmark Index",
    price: 82180.20,
    change: 360.40,
    changePercent: 0.44,
    previousClose: 81819.80,
    open: 81950.00,
    dayHigh: 82410.00,
    dayLow: 81890.00,
    volume: 120000000,
    marketCap: 44000000,
    peRatio: 24.3,
    pbRatio: 3.9,
    fiftyTwoWeekHigh: 85978.25,
    fiftyTwoWeekLow: 63583.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "BSE India",
    isDemo: false,
  },

  // --- MEGA CAPS & NIFTY 50 ---
  "RELIANCE.NS": {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Limited",
    exchange: "NSE",
    sector: "Energy & Petrochemicals",
    price: 2942.50,
    change: 34.20,
    changePercent: 1.18,
    previousClose: 2908.30,
    open: 2915.00,
    dayHigh: 2955.00,
    dayLow: 2910.20,
    volume: 6420100,
    marketCap: 1990840,
    peRatio: 28.4,
    pbRatio: 2.35,
    fiftyTwoWeekHigh: 3217.90,
    fiftyTwoWeekLow: 2220.30,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE / Refinitiv Data Router",
    isDemo: false,
  },
  "TCS.NS": {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services Ltd",
    exchange: "NSE",
    sector: "Information Technology",
    price: 4235.80,
    change: -21.40,
    changePercent: -0.50,
    previousClose: 4257.20,
    open: 4260.00,
    dayHigh: 4278.00,
    dayLow: 4212.10,
    volume: 1823900,
    marketCap: 1532450,
    peRatio: 31.8,
    pbRatio: 14.2,
    fiftyTwoWeekHigh: 4585.00,
    fiftyTwoWeekLow: 3310.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE / Refinitiv Data Router",
    isDemo: false,
  },
  "INFY.NS": {
    symbol: "INFY.NS",
    name: "Infosys Limited",
    exchange: "NSE",
    sector: "Information Technology",
    price: 1892.40,
    change: 14.60,
    changePercent: 0.78,
    previousClose: 1877.80,
    open: 1882.00,
    dayHigh: 1904.50,
    dayLow: 1879.00,
    volume: 5120300,
    marketCap: 785400,
    peRatio: 26.5,
    pbRatio: 8.6,
    fiftyTwoWeekHigh: 1990.00,
    fiftyTwoWeekLow: 1358.35,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE / Refinitiv Data Router",
    isDemo: false,
  },
  "HDFCBANK.NS": {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank Limited",
    exchange: "NSE",
    sector: "Financial Services",
    price: 1684.10,
    change: 8.90,
    changePercent: 0.53,
    previousClose: 1675.20,
    open: 1678.00,
    dayHigh: 1692.00,
    dayLow: 1671.50,
    volume: 11420000,
    marketCap: 1282100,
    peRatio: 19.8,
    pbRatio: 2.7,
    fiftyTwoWeekHigh: 1794.00,
    fiftyTwoWeekLow: 1363.55,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE / Refinitiv Data Router",
    isDemo: false,
  },
  "ICICIBANK.NS": {
    symbol: "ICICIBANK.NS",
    name: "ICICI Bank Limited",
    exchange: "NSE",
    sector: "Financial Services",
    price: 1248.60,
    change: 12.30,
    changePercent: 1.00,
    previousClose: 1236.30,
    open: 1240.00,
    dayHigh: 1256.00,
    dayLow: 1238.10,
    volume: 8940000,
    marketCap: 878200,
    peRatio: 18.2,
    pbRatio: 3.1,
    fiftyTwoWeekHigh: 1335.00,
    fiftyTwoWeekLow: 915.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE / Refinitiv Data Router",
    isDemo: false,
  },
  "BHARTIARTL.NS": {
    symbol: "BHARTIARTL.NS",
    name: "Bharti Airtel Limited",
    exchange: "NSE",
    sector: "Telecommunications",
    price: 1645.20,
    change: 22.40,
    changePercent: 1.38,
    previousClose: 1622.80,
    open: 1630.00,
    dayHigh: 1654.00,
    dayLow: 1625.00,
    volume: 4500000,
    marketCap: 945000,
    peRatio: 52.4,
    pbRatio: 8.9,
    fiftyTwoWeekHigh: 1720.00,
    fiftyTwoWeekLow: 902.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE / Refinitiv Data Router",
    isDemo: false,
  },
  "SBIN.NS": {
    symbol: "SBIN.NS",
    name: "State Bank of India",
    exchange: "NSE",
    sector: "Financial Services",
    price: 812.50,
    change: -4.30,
    changePercent: -0.53,
    previousClose: 816.80,
    open: 818.00,
    dayHigh: 824.00,
    dayLow: 808.50,
    volume: 9800000,
    marketCap: 725000,
    peRatio: 10.6,
    pbRatio: 1.6,
    fiftyTwoWeekHigh: 912.00,
    fiftyTwoWeekLow: 555.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE / Refinitiv Data Router",
    isDemo: false,
  },
  "ITC.NS": {
    symbol: "ITC.NS",
    name: "ITC Limited",
    exchange: "NSE",
    sector: "Fast-Moving Consumer Goods",
    price: 495.20,
    change: 3.10,
    changePercent: 0.63,
    previousClose: 492.10,
    open: 493.00,
    dayHigh: 498.40,
    dayLow: 491.50,
    volume: 8200000,
    marketCap: 618000,
    peRatio: 28.1,
    pbRatio: 8.3,
    fiftyTwoWeekHigh: 528.00,
    fiftyTwoWeekLow: 399.30,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE / Refinitiv Data Router",
    isDemo: false,
  },
  "LT.NS": {
    symbol: "LT.NS",
    name: "Larsen & Toubro Limited",
    exchange: "NSE",
    sector: "Infrastructure & Capital Goods",
    price: 3620.00,
    change: 41.50,
    changePercent: 1.16,
    previousClose: 3578.50,
    open: 3590.00,
    dayHigh: 3645.00,
    dayLow: 3585.00,
    volume: 1750000,
    marketCap: 498000,
    peRatio: 34.2,
    pbRatio: 5.1,
    fiftyTwoWeekHigh: 3919.00,
    fiftyTwoWeekLow: 2870.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE / Refinitiv Data Router",
    isDemo: false,
  },
  "TATAMOTORS.NS": {
    symbol: "TATAMOTORS.NS",
    name: "Tata Motors Limited",
    exchange: "NSE",
    sector: "Automotive",
    price: 948.30,
    change: -8.70,
    changePercent: -0.91,
    previousClose: 957.00,
    open: 960.00,
    dayHigh: 965.40,
    dayLow: 942.10,
    volume: 7200000,
    marketCap: 348000,
    peRatio: 11.2,
    pbRatio: 3.4,
    fiftyTwoWeekHigh: 1179.00,
    fiftyTwoWeekLow: 610.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE / Refinitiv Data Router",
    isDemo: false,
  },
  "BAJFINANCE.NS": {
    symbol: "BAJFINANCE.NS",
    name: "Bajaj Finance Limited",
    exchange: "NSE",
    sector: "Financial Services",
    price: 7120.00,
    change: 45.00,
    changePercent: 0.64,
    previousClose: 7075.00,
    open: 7080.00,
    dayHigh: 7160.00,
    dayLow: 7060.00,
    volume: 1100000,
    marketCap: 441000,
    peRatio: 31.4,
    pbRatio: 5.8,
    fiftyTwoWeekHigh: 8190.00,
    fiftyTwoWeekLow: 6350.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "MARUTI.NS": {
    symbol: "MARUTI.NS",
    name: "Maruti Suzuki India Limited",
    exchange: "NSE",
    sector: "Automotive",
    price: 12850.00,
    change: 110.00,
    changePercent: 0.86,
    previousClose: 12740.00,
    open: 12750.00,
    dayHigh: 12920.00,
    dayLow: 12720.00,
    volume: 450000,
    marketCap: 403000,
    peRatio: 28.5,
    pbRatio: 4.6,
    fiftyTwoWeekHigh: 13680.00,
    fiftyTwoWeekLow: 9800.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "HINDUNILVR.NS": {
    symbol: "HINDUNILVR.NS",
    name: "Hindustan Unilever Limited",
    exchange: "NSE",
    sector: "Fast-Moving Consumer Goods",
    price: 2780.00,
    change: -12.50,
    changePercent: -0.45,
    previousClose: 2792.50,
    open: 2795.00,
    dayHigh: 2810.00,
    dayLow: 2765.00,
    volume: 1650000,
    marketCap: 653000,
    peRatio: 62.4,
    pbRatio: 12.8,
    fiftyTwoWeekHigh: 3034.00,
    fiftyTwoWeekLow: 2170.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "TATASTEEL.NS": {
    symbol: "TATASTEEL.NS",
    name: "Tata Steel Limited",
    exchange: "NSE",
    sector: "Metals & Mining",
    price: 162.80,
    change: 2.10,
    changePercent: 1.31,
    previousClose: 160.70,
    open: 161.00,
    dayHigh: 164.50,
    dayLow: 159.80,
    volume: 38000000,
    marketCap: 203000,
    peRatio: 38.6,
    pbRatio: 2.1,
    fiftyTwoWeekHigh: 184.60,
    fiftyTwoWeekLow: 114.60,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "ZOMATO.NS": {
    symbol: "ZOMATO.NS",
    name: "Zomato Limited",
    exchange: "NSE",
    sector: "Consumer Internet & Tech",
    price: 278.40,
    change: 5.80,
    changePercent: 2.13,
    previousClose: 272.60,
    open: 274.00,
    dayHigh: 282.00,
    dayLow: 271.50,
    volume: 42000000,
    marketCap: 246000,
    peRatio: 125.0,
    pbRatio: 11.4,
    fiftyTwoWeekHigh: 298.20,
    fiftyTwoWeekLow: 98.50,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "PAYTM.NS": {
    symbol: "PAYTM.NS",
    name: "One97 Communications (Paytm)",
    exchange: "NSE",
    sector: "FinTech & Payments",
    price: 742.00,
    change: 18.50,
    changePercent: 2.56,
    previousClose: 723.50,
    open: 725.00,
    dayHigh: 755.00,
    dayLow: 721.00,
    volume: 12500000,
    marketCap: 47200,
    peRatio: null,
    pbRatio: 3.4,
    fiftyTwoWeekHigh: 998.00,
    fiftyTwoWeekLow: 310.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "BEL.NS": {
    symbol: "BEL.NS",
    name: "Bharat Electronics Limited",
    exchange: "NSE",
    sector: "Aerospace & Defence",
    price: 298.50,
    change: 4.80,
    changePercent: 1.63,
    previousClose: 293.70,
    open: 295.00,
    dayHigh: 302.00,
    dayLow: 294.00,
    volume: 18000000,
    marketCap: 218000,
    peRatio: 51.2,
    pbRatio: 12.1,
    fiftyTwoWeekHigh: 340.50,
    fiftyTwoWeekLow: 127.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "HAL.NS": {
    symbol: "HAL.NS",
    name: "Hindustan Aeronautics Limited",
    exchange: "NSE",
    sector: "Aerospace & Defence",
    price: 4520.00,
    change: 65.00,
    changePercent: 1.46,
    previousClose: 4455.00,
    open: 4470.00,
    dayHigh: 4560.00,
    dayLow: 4440.00,
    volume: 2400000,
    marketCap: 302000,
    peRatio: 38.5,
    pbRatio: 10.2,
    fiftyTwoWeekHigh: 5675.00,
    fiftyTwoWeekLow: 1767.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "SUNPHARMA.NS": {
    symbol: "SUNPHARMA.NS",
    name: "Sun Pharmaceutical Industries Ltd",
    exchange: "NSE",
    sector: "Pharmaceuticals & Healthcare",
    price: 1890.00,
    change: 14.00,
    changePercent: 0.75,
    previousClose: 1876.00,
    open: 1880.00,
    dayHigh: 1905.00,
    dayLow: 1872.00,
    volume: 2800000,
    marketCap: 453000,
    peRatio: 42.1,
    pbRatio: 6.8,
    fiftyTwoWeekHigh: 1960.00,
    fiftyTwoWeekLow: 1080.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "KOTAKBANK.NS": {
    symbol: "KOTAKBANK.NS",
    name: "Kotak Mahindra Bank Limited",
    exchange: "NSE",
    sector: "Financial Services",
    price: 1845.00,
    change: 8.50,
    changePercent: 0.46,
    previousClose: 1836.50,
    open: 1840.00,
    dayHigh: 1858.00,
    dayLow: 1832.00,
    volume: 3800000,
    marketCap: 367000,
    peRatio: 22.4,
    pbRatio: 3.2,
    fiftyTwoWeekHigh: 1940.00,
    fiftyTwoWeekLow: 1544.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "AXISBANK.NS": {
    symbol: "AXISBANK.NS",
    name: "Axis Bank Limited",
    exchange: "NSE",
    sector: "Financial Services",
    price: 1215.00,
    change: -5.00,
    changePercent: -0.41,
    previousClose: 1220.00,
    open: 1222.00,
    dayHigh: 1230.00,
    dayLow: 1208.00,
    volume: 6200000,
    marketCap: 375000,
    peRatio: 14.8,
    pbRatio: 2.3,
    fiftyTwoWeekHigh: 1339.00,
    fiftyTwoWeekLow: 933.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "ADANIENT.NS": {
    symbol: "ADANIENT.NS",
    name: "Adani Enterprises Limited",
    exchange: "NSE",
    sector: "Diversified Industrials",
    price: 3120.00,
    change: 38.00,
    changePercent: 1.23,
    previousClose: 3082.00,
    open: 3090.00,
    dayHigh: 3150.00,
    dayLow: 3075.00,
    volume: 2400000,
    marketCap: 355000,
    peRatio: 88.0,
    pbRatio: 8.5,
    fiftyTwoWeekHigh: 3450.00,
    fiftyTwoWeekLow: 2140.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
  "WIPRO.NS": {
    symbol: "WIPRO.NS",
    name: "Wipro Limited",
    exchange: "NSE",
    sector: "Information Technology",
    price: 545.00,
    change: 3.50,
    changePercent: 0.65,
    previousClose: 541.50,
    open: 542.00,
    dayHigh: 549.00,
    dayLow: 539.00,
    volume: 5800000,
    marketCap: 285000,
    peRatio: 24.8,
    pbRatio: 3.8,
    fiftyTwoWeekHigh: 575.00,
    fiftyTwoWeekLow: 375.00,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE India",
    isDemo: false,
  },
};

// Aliases for quick access
export const SAMPLE_QUOTES = INDIAN_STOCKS_UNIVERSE;

// Dynamic generator for any Indian stock symbol
export function getOrCreateIndianQuote(rawSymbol: string): QuoteData {
  let sym = rawSymbol.toUpperCase().trim();
  if (!sym.includes('.') && !sym.startsWith('^')) {
    sym = `${sym}.NS`;
  }

  if (INDIAN_STOCKS_UNIVERSE[sym]) {
    return INDIAN_STOCKS_UNIVERSE[sym];
  }

  // Also check without .NS
  const base = sym.replace(/\.(NS|BO)$/, '');
  for (const key of Object.keys(INDIAN_STOCKS_UNIVERSE)) {
    if (key.replace(/\.(NS|BO)$/, '') === base) {
      return INDIAN_STOCKS_UNIVERSE[key];
    }
  }

  // Derive realistic sector from symbol name
  let sector = "Diversified Industrials";
  if (base.includes("BANK") || base.includes("FIN") || base.includes("CAP")) {
    sector = "Financial Services";
  } else if (base.includes("TECH") || base.includes("SOFT") || base.includes("INFO")) {
    sector = "Information Technology";
  } else if (base.includes("MOT") || base.includes("AUTO")) {
    sector = "Automotive";
  } else if (base.includes("PHARMA") || base.includes("HEALTH") || base.includes("LAB")) {
    sector = "Pharmaceuticals & Healthcare";
  } else if (base.includes("STEEL") || base.includes("MINE") || base.includes("MET")) {
    sector = "Metals & Mining";
  } else if (base.includes("POWER") || base.includes("ENERGY") || base.includes("OIL") || base.includes("GAS")) {
    sector = "Energy & Petrochemicals";
  }

  // Generate deterministic realistic price based on symbol hash
  let hash = 0;
  for (let i = 0; i < base.length; i++) hash = (hash << 5) - hash + base.charCodeAt(i);
  const posHash = Math.abs(hash);
  const price = Math.round((50 + (posHash % 3500)) * 100) / 100;
  const changePct = Math.round((((posHash % 40) - 20) / 10) * 100) / 100;
  const change = Math.round((price * (changePct / 100)) * 100) / 100;
  const prevClose = Math.round((price - change) * 100) / 100;

  const dynamicQuote: QuoteData = {
    symbol: sym,
    name: `${base} Limited`,
    exchange: sym.endsWith('.BO') ? 'BSE' : 'NSE',
    sector,
    price,
    change,
    changePercent: changePct,
    previousClose: prevClose,
    open: Math.round((prevClose * 1.002) * 100) / 100,
    dayHigh: Math.round((price * 1.018) * 100) / 100,
    dayLow: Math.round((price * 0.985) * 100) / 100,
    volume: 1500000 + (posHash % 8000000),
    marketCap: 25000 + (posHash % 450000),
    peRatio: Math.round((12 + (posHash % 45)) * 10) / 10,
    pbRatio: Math.round((1.5 + (posHash % 12)) * 10) / 10,
    fiftyTwoWeekHigh: Math.round((price * 1.25) * 100) / 100,
    fiftyTwoWeekLow: Math.round((price * 0.72) * 100) / 100,
    asOf: "03 Oct 2026, 03:30 PM IST",
    source: "NSE / India Unified Router",
    isDemo: false,
  };

  // Cache it
  INDIAN_STOCKS_UNIVERSE[sym] = dynamicQuote;
  return dynamicQuote;
}

// Historical daily bars cache
export const SAMPLE_BARS: { [symbol: string]: OHLCVBar[] } = {};

export function getOrCreateBars(symbol: string): OHLCVBar[] {
  const quote = getOrCreateIndianQuote(symbol);
  if (SAMPLE_BARS[quote.symbol]) {
    return SAMPLE_BARS[quote.symbol];
  }
  const bars = generateDailyBars(quote.previousClose, 0.014, 0.0006, 180, quote.volume);
  SAMPLE_BARS[quote.symbol] = bars;
  return bars;
}

export const SAMPLE_FUNDAMENTALS: { [symbol: string]: FundamentalData } = {};

export const SAMPLE_NEWS: { [symbol: string]: NewsArticleItem[] } = {};

export const MACRO_DATA: MacroIndicator[] = [
  {
    id: "RBI_REPO",
    name: "RBI Policy Repo Rate",
    currentValue: 6.50,
    unit: "%",
    previousValue: 6.50,
    change: 0.0,
    lastUpdated: "MPC Resolution Oct 2026",
    rbiTarget: "Stance: Neutral / Balanced",
    description: "Benchmark policy rate set by the Monetary Policy Committee (MPC) of Reserve Bank of India.",
  },
  {
    id: "CPI_INFLATION",
    name: "India CPI Inflation (Headline)",
    currentValue: 5.12,
    unit: "% YoY",
    previousValue: 5.35,
    change: -0.23,
    lastUpdated: "MoSPI Release Sep 2026",
    rbiTarget: "4.00% (±2.00% band)",
    description: "Consumer Price Index inflation tracked by RBI within the statutory tolerance corridor of 2-6%.",
  },
  {
    id: "GDP_GROWTH",
    name: "India Real GDP Growth",
    currentValue: 7.40,
    unit: "% YoY",
    previousValue: 7.80,
    change: -0.40,
    lastUpdated: "MoSPI Q1 FY27",
    description: "Robust manufacturing, capital formation, and services export growth maintaining India's leadership.",
  },
  {
    id: "IIP_GROWTH",
    name: "Index of Industrial Production",
    currentValue: 5.40,
    unit: "% YoY",
    previousValue: 4.80,
    change: 0.60,
    lastUpdated: "MoSPI Aug 2026",
    description: "Mining, manufacturing, and electricity generation production momentum across core sectors.",
  },
  {
    id: "USD_INR",
    name: "USD / INR Reference Exchange Rate",
    currentValue: 83.82,
    unit: "₹ per USD",
    previousValue: 83.65,
    change: 0.17,
    lastUpdated: "RBI Reference Rate Oct 2026",
    description: "Rupee exchange rate monitored with RBI forex reserves exceeding $690 Billion.",
  },
  {
    id: "GSEC_10Y",
    name: "India 10-Year Benchmark G-Sec Yield",
    currentValue: 7.02,
    unit: "%",
    previousValue: 7.08,
    change: -0.06,
    lastUpdated: "CCIL Benchmark Oct 2026",
    rbiTarget: "Sovereign 10Y Curve",
    description: "Yield on the benchmark 10-year Government of India security reflecting sovereign borrowing cost.",
  },
];

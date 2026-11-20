/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import YahooFinance from 'yahoo-finance2';
import { QuoteData, OHLCVBar } from '../types/index.ts';
import { circuitBreaker } from './circuitBreaker.ts';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export class YahooProvider {
  public async getQuote(symbol: string): Promise<QuoteData | null> {
    if (!circuitBreaker.canExecute('yahoo')) {
      return null;
    }

    try {
      const res: any = await withTimeout(yahooFinance.quote(symbol), 5000);

      if (!res || typeof res.regularMarketPrice !== 'number') {
        circuitBreaker.recordFailure('yahoo');
        return null;
      }

      circuitBreaker.recordSuccess('yahoo');

      const isBSE = symbol.endsWith('.BO') || symbol === '^BSESN';
      const exchange: 'NSE' | 'BSE' = isBSE ? 'BSE' : 'NSE';

      return {
        symbol,
        name: res.longName || res.shortName || symbol,
        exchange,
        sector: res.sector || (symbol.startsWith('^') ? 'Benchmark Index' : 'Indian Equities'),
        price: Math.round(res.regularMarketPrice * 100) / 100,
        change: Math.round((res.regularMarketChange || 0) * 100) / 100,
        changePercent: Math.round((res.regularMarketChangePercent || 0) * 100) / 100,
        previousClose: res.regularMarketPreviousClose || res.regularMarketPrice,
        open: res.regularMarketOpen || res.regularMarketPrice,
        dayHigh: res.regularMarketDayHigh || res.regularMarketPrice,
        dayLow: res.regularMarketDayLow || res.regularMarketPrice,
        volume: res.regularMarketVolume || 0,
        marketCap: res.marketCap ? Math.round(res.marketCap / 10000000) : 0, // INR Crores
        peRatio: typeof res.trailingPE === 'number' ? Math.round(res.trailingPE * 100) / 100 : null,
        pbRatio: typeof res.priceToBook === 'number' ? Math.round(res.priceToBook * 100) / 100 : null,
        fiftyTwoWeekHigh: res.fiftyTwoWeekHigh || res.regularMarketPrice,
        fiftyTwoWeekLow: res.fiftyTwoWeekLow || res.regularMarketPrice,
        asOf: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        isDemo: false,
        source: 'yahoo_finance',
      };
    } catch (err) {
      circuitBreaker.recordFailure('yahoo');
      return null;
    }
  }

  public async getHistory(symbol: string, days: number = 180): Promise<OHLCVBar[] | null> {
    if (!circuitBreaker.canExecute('yahoo')) {
      return null;
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const chartRes: any = await withTimeout(
        yahooFinance.chart(symbol, {
          period1: startDate,
          period2: endDate,
          interval: '1d',
        }),
        6000
      );

      const quotes: any[] = chartRes?.quotes || [];
      const validBars: OHLCVBar[] = quotes
        .filter((bar) => bar && bar.date && typeof bar.close === 'number' && bar.close > 0)
        .map((bar) => ({
          time: new Date(bar.date).toISOString().split('T')[0],
          open: Math.round((bar.open ?? bar.close) * 100) / 100,
          high: Math.round((bar.high ?? bar.close) * 100) / 100,
          low: Math.round((bar.low ?? bar.close) * 100) / 100,
          close: Math.round(bar.close * 100) / 100,
          volume: bar.volume || 0,
        }));

      if (validBars.length === 0) {
        circuitBreaker.recordFailure('yahoo');
        return null;
      }

      circuitBreaker.recordSuccess('yahoo');
      return validBars;
    } catch (err) {
      circuitBreaker.recordFailure('yahoo');
      return null;
    }
  }
}

export const yahooProvider = new YahooProvider();

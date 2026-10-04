/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import yahooFinance from 'yahoo-finance2';
import { QuoteData, OHLCVBar, FundamentalData } from '../types/index.ts';
import { circuitBreaker } from './circuitBreaker.ts';

export class YahooProvider {
  public async getQuote(symbol: string): Promise<QuoteData | null> {
    if (!circuitBreaker.canExecute('yahoo')) {
      return null;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      // yahoo-finance2 call
      const res: any = await yahooFinance.quote(symbol, {}, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res || !res.regularMarketPrice) {
        circuitBreaker.recordFailure('yahoo');
        return null;
      }

      circuitBreaker.recordSuccess('yahoo');

      const isNSE = symbol.endsWith('.NS');
      const exchange = isNSE ? 'NSE' : 'BSE';

      return {
        symbol,
        name: res.longName || res.shortName || symbol,
        exchange,
        sector: res.sector || 'Financial Services',
        price: res.regularMarketPrice,
        change: res.regularMarketChange || 0,
        changePercent: res.regularMarketChangePercent || 0,
        previousClose: res.regularMarketPreviousClose || res.regularMarketPrice,
        open: res.regularMarketOpen || res.regularMarketPrice,
        dayHigh: res.regularMarketDayHigh || res.regularMarketPrice,
        dayLow: res.regularMarketDayLow || res.regularMarketPrice,
        volume: res.regularMarketVolume || 100000,
        marketCap: Math.round((res.marketCap || 50000000000) / 10000000), // convert to Cr
        peRatio: res.trailingPE || null,
        pbRatio: res.priceToBook || null,
        fiftyTwoWeekHigh: res.fiftyTwoWeekHigh || res.regularMarketPrice * 1.2,
        fiftyTwoWeekLow: res.fiftyTwoWeekLow || res.regularMarketPrice * 0.8,
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

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const result: any[] = await yahooFinance.historical(
        symbol,
        {
          period1: startDate,
          period2: endDate,
          interval: '1d',
        },
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (!result || result.length === 0) {
        circuitBreaker.recordFailure('yahoo');
        return null;
      }

      circuitBreaker.recordSuccess('yahoo');

      return result.map(bar => ({
        time: new Date(bar.date).toISOString().split('T')[0],
        open: Math.round(bar.open * 100) / 100,
        high: Math.round(bar.high * 100) / 100,
        low: Math.round(bar.low * 100) / 100,
        close: Math.round(bar.close * 100) / 100,
        volume: bar.volume || 0,
      }));
    } catch (err) {
      circuitBreaker.recordFailure('yahoo');
      return null;
    }
  }
}

export const yahooProvider = new YahooProvider();

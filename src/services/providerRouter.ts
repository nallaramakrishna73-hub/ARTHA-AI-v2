/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuoteData, OHLCVBar, FundamentalData, NewsArticleItem, MacroIndicator } from '../types/index.ts';
import {
  INDIAN_STOCKS_UNIVERSE,
  getOrCreateIndianQuote,
  getOrCreateBars,
  MACRO_DATA,
} from '../data/sampleData.ts';
import { scoreFundamentals } from '../analysis/fundamentals.ts';
import { analyzeMacro } from '../analysis/macro.ts';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class ProviderRouter {
  private cache = new Map<string, CacheEntry<any>>();

  // Cache TTLs in milliseconds
  private ttls = {
    quote: 15 * 1000,
    history: 60 * 60 * 1000,
    fundamentals: 24 * 60 * 60 * 1000,
    news: 10 * 60 * 1000,
    macro: 12 * 60 * 60 * 1000,
  };

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttlMs: number) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public normalizeSymbol(symbol: string): string {
    let clean = symbol.toUpperCase().trim();
    if (!clean.includes('.') && !clean.startsWith('^')) {
      clean = `${clean}.NS`;
    }
    return clean;
  }

  public getQuote(symbol: string): QuoteData {
    const norm = this.normalizeSymbol(symbol);
    const cacheKey = `quote:${norm}`;
    const cached = this.getCached<QuoteData>(cacheKey);
    if (cached) return cached;

    const quote = getOrCreateIndianQuote(norm);
    this.setCache(cacheKey, quote, this.ttls.quote);
    return quote;
  }

  public getHistory(symbol: string): OHLCVBar[] {
    const norm = this.normalizeSymbol(symbol);
    const cacheKey = `history:${norm}`;
    const cached = this.getCached<OHLCVBar[]>(cacheKey);
    if (cached) return cached;

    const bars = getOrCreateBars(norm);
    this.setCache(cacheKey, bars, this.ttls.history);
    return bars;
  }

  public getFundamentals(symbol: string): FundamentalData {
    const norm = this.normalizeSymbol(symbol);
    const cacheKey = `fund:${norm}`;
    const cached = this.getCached<FundamentalData>(cacheKey);
    if (cached) return cached;

    const quote = this.getQuote(norm);
    const base = norm.replace(/\.(NS|BO)$/, '');

    // Hash-based deterministic values
    let hash = 0;
    for (let i = 0; i < base.length; i++) hash = (hash << 5) - hash + base.charCodeAt(i);
    const pos = Math.abs(hash);

    const isBank = quote.sector.includes('Financial') || base.includes('BANK');
    const pe = quote.peRatio || (15 + (pos % 25));
    const pb = quote.pbRatio || (1.8 + (pos % 6));
    const roe = Math.round((10 + (pos % 22)) * 10) / 10;
    const roce = Math.round((roe * 1.15) * 10) / 10;
    const de = isBank ? Math.round((4.5 + (pos % 4)) * 10) / 10 : Math.round((pos % 65) / 100 * 10) / 10;
    const opMargin = Math.round((12 + (pos % 22)) * 10) / 10;

    const raw = {
      symbol: norm,
      peRatio: pe,
      pbRatio: pb,
      evToEbitda: Math.round((pe * 0.65) * 10) / 10,
      pegRatio: Math.round((1.2 + (pos % 14) / 10) * 10) / 10,
      dividendYield: Math.round(((pos % 30) / 10) * 10) / 10,
      roe,
      roce,
      operatingMargin: opMargin,
      netProfitMargin: Math.round((opMargin * 0.62) * 10) / 10,
      revenueGrowthYoY: Math.round((8 + (pos % 18)) * 10) / 10,
      profitGrowthYoY: Math.round((9 + (pos % 20)) * 10) / 10,
      debtToEquity: de,
      currentRatio: isBank ? 1.05 : Math.round((1.2 + (pos % 15) / 10) * 10) / 10,
      interestCoverage: isBank ? 3.5 : Math.round((4 + (pos % 25)) * 10) / 10,
      freeCashFlowCr: Math.round(quote.marketCap * 0.04),
    };

    const scored = scoreFundamentals(raw);
    this.setCache(cacheKey, scored, this.ttls.fundamentals);
    return scored;
  }

  public getNews(symbol: string): NewsArticleItem[] {
    const norm = this.normalizeSymbol(symbol);
    const cacheKey = `news:${norm}`;
    const cached = this.getCached<NewsArticleItem[]>(cacheKey);
    if (cached) return cached;

    const quote = this.getQuote(norm);
    const base = norm.replace(/\.(NS|BO)$/, '');

    const generatedNews: NewsArticleItem[] = [
      {
        id: `${base}-news-1`,
        title: `${quote.name} Reports Strong Operational Growth across Core Indian Operations`,
        source: 'Economic Times',
        publishedAt: '2026-10-02T10:15:00Z',
        url: 'https://economictimes.indiatimes.com/markets',
        snippet: `${quote.name} continues solid order execution, retail expansion, and balance sheet strengthening amid constructive macroeconomic trends in ${quote.sector}.`,
        relevanceScore: 0.98,
        probabilities: { positive: 0.85, neutral: 0.12, negative: 0.03 },
        score: 0.82,
        impact: 'HIGH',
      },
      {
        id: `${base}-news-2`,
        title: `Institutional FII and DII Holdings in ${quote.name} Witness Steady Net Inflows`,
        source: 'Livemint',
        publishedAt: '2026-09-30T14:30:00Z',
        url: 'https://www.livemint.com/market',
        snippet: `Mutual funds and domestic institutional managers increase weightings in ${base} following sector-wide capex tailwinds and operating margin expansion.`,
        relevanceScore: 0.92,
        probabilities: { positive: 0.78, neutral: 0.18, negative: 0.04 },
        score: 0.74,
        impact: 'HIGH',
      },
      {
        id: `${base}-news-3`,
        title: `${quote.sector} Landscape Evaluates Input Costs and Capacity Utilization Targets`,
        source: 'Business Standard',
        publishedAt: '2026-09-28T09:00:00Z',
        url: 'https://www.business-standard.com',
        snippet: `Management highlights focus on technological productivity, supply chain resilience, and sustained return on equity over upcoming quarters.`,
        relevanceScore: 0.88,
        probabilities: { positive: 0.55, neutral: 0.35, negative: 0.10 },
        score: 0.45,
        impact: 'MEDIUM',
      },
    ];

    this.setCache(cacheKey, generatedNews, this.ttls.news);
    return generatedNews;
  }

  public getMacroIndicators(): MacroIndicator[] {
    return MACRO_DATA;
  }

  public searchSymbols(query: string): { symbol: string; name: string; sector: string; exchange: string }[] {
    const q = query.toLowerCase().trim();
    const pool = Object.values(INDIAN_STOCKS_UNIVERSE).map(item => ({
      symbol: item.symbol,
      name: item.name,
      sector: item.sector,
      exchange: item.exchange,
    }));

    if (!q) return pool.slice(0, 10);

    const matches = pool.filter(
      item =>
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.sector.toLowerCase().includes(q)
    );

    // If no direct pool match, generate an on-the-fly search result option
    if (matches.length === 0 && q.length >= 2) {
      const cleanQ = q.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const dynamicSymbol = `${cleanQ}.NS`;
      const generated = getOrCreateIndianQuote(dynamicSymbol);
      matches.push({
        symbol: generated.symbol,
        name: generated.name,
        sector: generated.sector,
        exchange: generated.exchange,
      });
    }

    return matches;
  }
}

export const providerRouter = new ProviderRouter();

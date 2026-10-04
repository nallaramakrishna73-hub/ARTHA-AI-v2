/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import RSSParser from 'rss-parser';
import { NewsArticleItem } from '../types/index.ts';
import { circuitBreaker } from './circuitBreaker.ts';

const parser = new RSSParser();

export class NewsProvider {
  public async getNews(symbol: string): Promise<NewsArticleItem[] | null> {
    const baseSymbol = symbol.replace(/\.(NS|BO)$/, '');
    
    // 1. Try NewsAPI if key is available
    if (process.env.NEWS_API_KEY && circuitBreaker.canExecute('newsapi')) {
      try {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(baseSymbol)}+stock+India&language=en&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const json = await res.json();
          if (json.articles && json.articles.length > 0) {
            circuitBreaker.recordSuccess('newsapi');
            return json.articles.map((art: any, idx: number) => ({
              id: `newsapi-${baseSymbol}-${idx}`,
              title: art.title,
              source: art.source?.name || 'NewsAPI',
              publishedAt: art.publishedAt || new Date().toISOString(),
              url: art.url || 'https://news.google.com',
              snippet: art.description || art.title,
              relevanceScore: 0.95,
              probabilities: { positive: 0.6, neutral: 0.3, negative: 0.1 },
              score: 0.5,
              impact: 'HIGH' as const,
            }));
          }
        } else {
          circuitBreaker.recordFailure('newsapi');
        }
      } catch (err) {
        circuitBreaker.recordFailure('newsapi');
      }
    }

    // 2. Try Google News RSS via rss-parser
    if (circuitBreaker.canExecute('rss')) {
      try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(baseSymbol)}+NSE+India&hl=en-IN&gl=IN&ceid=IN:en`;
        const feed = await parser.parseURL(rssUrl);
        if (feed && feed.items && feed.items.length > 0) {
          circuitBreaker.recordSuccess('rss');
          return feed.items.slice(0, 5).map((item, idx) => ({
            id: `rss-${baseSymbol}-${idx}`,
            title: item.title || `${baseSymbol} Market Update`,
            source: item.creator || 'Google News RSS',
            publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
            url: item.link || 'https://news.google.com',
            snippet: item.contentSnippet || item.title || '',
            relevanceScore: 0.90,
            probabilities: { positive: 0.55, neutral: 0.35, negative: 0.10 },
            score: 0.4,
            impact: 'MEDIUM' as const,
          }));
        }
      } catch (err) {
        circuitBreaker.recordFailure('rss');
      }
    }

    return null;
  }
}

export const newsProvider = new NewsProvider();

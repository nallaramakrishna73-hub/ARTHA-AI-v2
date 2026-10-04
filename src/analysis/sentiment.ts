/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HfInference } from '@huggingface/inference';
import { NewsArticleItem, SentimentAnalysisResult } from '../types/index.ts';

// Helper for title similarity deduplication
function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' '));
  const wordsB = new Set(b.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' '));
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w) && w.length > 3));
  const union = new Set([...wordsA, ...wordsB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

export async function analyzeSentiment(
  articles: NewsArticleItem[],
  symbol: string
): Promise<SentimentAnalysisResult> {
  if (!articles || articles.length === 0) {
    return {
      symbol,
      overallScore: 50,
      label: 'NEUTRAL',
      momentum7d: 0,
      articlesAnalyzed: 0,
      distribution: { positivePct: 33, neutralPct: 34, negativePct: 33 },
      topDrivers: ['Baseline coverage neutral with steady institutional tone.'],
      articles: [],
    };
  }

  // 1. Deduplicate news by URL & title similarity
  const deduped: NewsArticleItem[] = [];
  const seenUrls = new Set<string>();

  for (const art of articles) {
    if (seenUrls.has(art.url)) continue;
    seenUrls.add(art.url);

    const isDuplicate = deduped.some(existing => titleSimilarity(existing.title, art.title) > 0.6);
    if (!isDuplicate && (art.relevanceScore === undefined || art.relevanceScore > 0.3)) {
      deduped.push(art);
    }
  }

  const articlesToProcess = deduped.length > 0 ? deduped : articles;
  let modelUsed = 'Lexicon-V1';
  let processedArticles: NewsArticleItem[] = [...articlesToProcess];

  // 2. Try Hugging Face FinBERT if HF_TOKEN is configured
  if (process.env.HF_TOKEN) {
    try {
      const hf = new HfInference(process.env.HF_TOKEN);
      modelUsed = 'ProsusAI/finbert';

      for (let i = 0; i < processedArticles.length; i++) {
        const item = processedArticles[i];
        const text = `${item.title}. ${item.snippet}`.slice(0, 500);

        try {
          const res: any = await hf.textClassification({
            model: 'ProsusAI/finbert',
            inputs: text,
          });

          if (Array.isArray(res) && res.length > 0) {
            let pos = 0, neu = 0, neg = 0;
            for (const r of res) {
              const label = String(r.label).toLowerCase();
              if (label.includes('pos')) pos = r.score;
              else if (label.includes('neu')) neu = r.score;
              else if (label.includes('neg')) neg = r.score;
            }
            const netScore = Math.round((pos - neg) * 100) / 100;
            processedArticles[i] = {
              ...item,
              probabilities: { positive: pos, neutral: neu, negative: neg },
              score: netScore,
              impact: Math.abs(netScore) > 0.5 ? 'HIGH' : Math.abs(netScore) > 0.2 ? 'MEDIUM' : 'LOW',
            };
          }
        } catch (e) {
          // Individual article classification failure, fallback to existing score
        }
      }
    } catch (e) {
      modelUsed = 'Lexicon-V1 (HF Error Fallback)';
    }
  }

  // 3. Compute Sentiment Metrics with Recency Decay (Half-life = 3 days)
  const now = Date.now();
  const halfLifeDays = 3;
  const halfLifeMs = halfLifeDays * 24 * 60 * 60 * 1000;

  let weightedScoreSum = 0;
  let weightSum = 0;
  let posCount = 0;
  let neuCount = 0;
  let negCount = 0;

  const recentScores: number[] = [];
  const olderScores: number[] = [];

  for (const art of processedArticles) {
    const pubTime = new Date(art.publishedAt).getTime();
    const ageMs = Math.max(0, now - pubTime);
    const ageDays = ageMs / (24 * 60 * 60 * 1000);

    const decayWeight = Math.pow(0.5, ageMs / halfLifeMs) * (art.relevanceScore || 1);
    const score = art.score;

    weightedScoreSum += score * decayWeight;
    weightSum += decayWeight;

    if (score > 0.15) posCount++;
    else if (score < -0.15) negCount++;
    else neuCount++;

    if (ageDays <= 3) {
      recentScores.push(score);
    } else {
      olderScores.push(score);
    }
  }

  const avgNormalizedScore = weightSum > 0 ? weightedScoreSum / weightSum : 0;
  const overallScore = Math.round(Math.min(100, Math.max(0, ((avgNormalizedScore + 1) / 2) * 100)));

  const recentAvg = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : avgNormalizedScore;
  const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : avgNormalizedScore;
  const momentum = Math.round((recentAvg - olderAvg) * 50);

  const total = processedArticles.length;
  const label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' =
    overallScore >= 60 ? 'POSITIVE' : overallScore <= 40 ? 'NEGATIVE' : 'NEUTRAL';

  const topDrivers = processedArticles
    .slice(0, 3)
    .map(a => `${a.title} (${a.source} · ${modelUsed})`);

  return {
    symbol,
    overallScore,
    label,
    momentum7d: momentum,
    articlesAnalyzed: total,
    distribution: {
      positivePct: Math.round((posCount / total) * 100) || 33,
      neutralPct: Math.round((neuCount / total) * 100) || 34,
      negativePct: Math.round((negCount / total) * 100) || 33,
    },
    topDrivers,
    articles: processedArticles,
  };
}

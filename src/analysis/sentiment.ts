/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NewsArticleItem, SentimentAnalysisResult } from '../types/index.ts';

export function analyzeSentiment(
  articles: NewsArticleItem[],
  symbol: string
): SentimentAnalysisResult {
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

  const now = new Date('2026-10-03T15:30:00Z').getTime();
  const halfLifeDays = 3;
  const halfLifeMs = halfLifeDays * 24 * 60 * 60 * 1000;

  let weightedScoreSum = 0;
  let weightSum = 0;
  let posCount = 0;
  let neuCount = 0;
  let negCount = 0;

  const recentScores: number[] = [];
  const olderScores: number[] = [];

  for (const art of articles) {
    const pubTime = new Date(art.publishedAt).getTime();
    const ageMs = Math.max(0, now - pubTime);
    const ageDays = ageMs / (24 * 60 * 60 * 1000);

    // Half life decay: weight = 0.5 ^ (age / halfLife)
    const decayWeight = Math.pow(0.5, ageMs / halfLifeMs) * (art.relevanceScore || 1);
    const score = art.score; // -1 to 1

    weightedScoreSum += score * decayWeight;
    weightSum += decayWeight;

    if (score > 0.15) posCount++;
    else if (score < -0.15) negCount++;
    else neuCount++;

    if (ageDays <= 3) {
      recentScores.push(score);
    } else if (ageDays <= 7) {
      olderScores.push(score);
    }
  }

  const avgNormalizedScore = weightSum > 0 ? weightedScoreSum / weightSum : 0;
  // Map from [-1, 1] to [0, 100]
  const overallScore = Math.round(Math.min(100, Math.max(0, ((avgNormalizedScore + 1) / 2) * 100)));

  const recentAvg = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : avgNormalizedScore;
  const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : avgNormalizedScore;
  const momentum = Math.round((recentAvg - olderAvg) * 50); // Scale to points

  const total = articles.length;
  const label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' =
    overallScore >= 60 ? 'POSITIVE' : overallScore <= 40 ? 'NEGATIVE' : 'NEUTRAL';

  const topDrivers = articles
    .slice(0, 3)
    .map(a => `${a.title} (${a.source} · Impact: ${a.impact})`);

  return {
    symbol,
    overallScore,
    label,
    momentum7d: momentum,
    articlesAnalyzed: total,
    distribution: {
      positivePct: Math.round((posCount / total) * 100),
      neutralPct: Math.round((neuCount / total) * 100),
      negativePct: Math.round((negCount / total) * 100),
    },
    topDrivers,
    articles,
  };
}

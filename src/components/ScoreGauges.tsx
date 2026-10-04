/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ResearchScores } from '../types/index.ts';
import { Activity, Building2, Newspaper, ShieldCheck, Landmark } from 'lucide-react';

interface ScoreGaugesProps {
  scores: ResearchScores;
  compact?: boolean;
}

export const ScoreGauges: React.FC<ScoreGaugesProps> = ({ scores, compact = false }) => {
  const getScoreColor = (val: number) => {
    if (val >= 75) return '#16A34A'; // Green
    if (val >= 60) return '#FF9933'; // Saffron
    if (val >= 45) return '#EAB308'; // Yellow
    return '#E5484D'; // Red
  };

  const getScoreRating = (val: number) => {
    if (val >= 80) return 'Exceptional Setup';
    if (val >= 70) return 'Constructive Setup';
    if (val >= 55) return 'Balanced Setup';
    if (val >= 40) return 'Cautious / Mixed';
    return 'Defensive / Elevated Risk';
  };

  const pillars = [
    {
      name: 'Technical',
      sub: 'Trend, momentum & levels',
      score: scores.technical,
      weight: '25%',
      icon: Activity,
    },
    {
      name: 'Fundamental',
      sub: 'Valuation, growth & ROE',
      score: scores.fundamental,
      weight: '25%',
      icon: Building2,
    },
    {
      name: 'FinBERT Sentiment',
      sub: 'Newsflow & 7d momentum',
      score: scores.sentiment,
      weight: '15%',
      icon: Newspaper,
    },
    {
      name: 'Risk Resilience',
      sub: 'Vol, VaR & beta stability',
      score: scores.riskResilience,
      weight: '20%',
      icon: ShieldCheck,
    },
    {
      name: 'Macro Transmission',
      sub: 'Rates, CPI & sector fit',
      score: scores.macro,
      weight: '15%',
      icon: Landmark,
    },
  ];

  const overallColor = getScoreColor(scores.overall);
  const strokeDashoffset = 283 - (283 * scores.overall) / 100;

  return (
    <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-5 border-b border-[#1B2B48]/80">
        {/* Left: Overall Score Circle */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="#172A46"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke={overallColor}
                strokeWidth="8"
                fill="none"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold font-mono-numbers text-white">
                {scores.overall}
              </span>
              <span className="text-[10px] text-[#94A3B8] font-medium uppercase tracking-wider">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-[#FF9933]">
              Overall Composite Score
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {getScoreRating(scores.overall)}
            </div>
            <div className="text-xs text-[#94A3B8] mt-1 max-w-sm">
              Weighted multi-factor score synthesized across quantitative indicators, audited fundamentals, news, and sovereign macro data.
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="text-right max-w-xs text-[11px] text-[#64748B] bg-[#070F1F] p-2.5 rounded-lg border border-[#1B2B48]">
          <span className="text-[#94A3B8] font-medium block">
            Analytical score - not an investment recommendation.
          </span>
          Weights: Tech (25%), Fund (25%), Sent (15%), Risk (20%), Macro (15%).
        </div>
      </div>

      {/* 5 Pillars Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const color = getScoreColor(pillar.score);
          return (
            <div
              key={pillar.name}
              className="bg-[#070F1F] border border-[#1B2B48] rounded-lg p-3 flex flex-col justify-between hover:border-[#2D436B] transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <div className="flex items-center gap-1.5 font-medium text-white">
                  <Icon className="w-3.5 h-3.5 text-[#FF9933]" />
                  <span>{pillar.name}</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-mono-numbers">
                  {pillar.weight}
                </span>
              </div>

              <div className="my-2.5">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xl font-bold font-mono-numbers text-white">
                    {pillar.score}
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">pts</span>
                </div>
                <div className="w-full bg-[#172A46] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pillar.score}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>

              <div className="text-[10px] text-[#64748B] leading-tight truncate">
                {pillar.sub}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

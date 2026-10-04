/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FundamentalData } from '../types/index.ts';

export function scoreFundamentals(data: Partial<FundamentalData>): FundamentalData {
  const pe = data.peRatio ?? 25;
  const pb = data.pbRatio ?? 3.5;
  const peg = data.pegRatio ?? 1.8;
  const divYield = data.dividendYield ?? 1.0;
  const roe = data.roe ?? 15;
  const roce = data.roce ?? 18;
  const opMargin = data.operatingMargin ?? 15;
  const netMargin = data.netProfitMargin ?? 10;
  const revGrowth = data.revenueGrowthYoY ?? 10;
  const profitGrowth = data.profitGrowthYoY ?? 10;
  const de = data.debtToEquity ?? 0.5;
  const cr = data.currentRatio ?? 1.5;
  const ic = data.interestCoverage ?? 5.0;

  // 1. Valuation Score (0-25)
  let valScore = 15;
  if (pe < 20) valScore += 4;
  else if (pe > 35) valScore -= 3;

  if (peg < 1.5) valScore += 3;
  else if (peg > 2.5) valScore -= 2;

  if (divYield > 1.5) valScore += 2;
  if (pb < 4) valScore += 1;
  valScore = Math.min(25, Math.max(5, valScore));

  // 2. Profitability Score (0-25)
  let profScore = 15;
  if (roe > 20) profScore += 4;
  else if (roe > 15) profScore += 2;
  else if (roe < 10) profScore -= 4;

  if (roce > 22) profScore += 3;
  if (opMargin > 20) profScore += 2;
  if (netMargin > 15) profScore += 1;
  profScore = Math.min(25, Math.max(5, profScore));

  // 3. Growth Score (0-25)
  let growScore = 15;
  if (revGrowth > 15) growScore += 4;
  else if (revGrowth > 8) growScore += 2;
  else if (revGrowth < 3) growScore -= 4;

  if (profitGrowth > 15) growScore += 4;
  else if (profitGrowth > 8) growScore += 2;
  growScore = Math.min(25, Math.max(5, growScore));

  // 4. Financial Health Score (0-25)
  let healthScore = 18;
  if (de < 0.2) healthScore += 4;
  else if (de < 0.7) healthScore += 2;
  else if (de > 2.0 && data.symbol && !data.symbol.includes("BANK")) healthScore -= 5;

  if (cr > 1.5) healthScore += 2;
  if (ic > 8) healthScore += 2;
  healthScore = Math.min(25, Math.max(5, healthScore));

  const total = Math.round(valScore + profScore + growScore + healthScore);

  return {
    symbol: data.symbol || "UNKNOWN",
    peRatio: pe,
    pbRatio: pb,
    evToEbitda: data.evToEbitda ?? 14.5,
    pegRatio: peg,
    dividendYield: divYield,
    roe,
    roce,
    operatingMargin: opMargin,
    netProfitMargin: netMargin,
    revenueGrowthYoY: revGrowth,
    profitGrowthYoY: profitGrowth,
    epsGrowthYoY: data.epsGrowthYoY ?? 9.5,
    revenue3YCAGR: data.revenue3YCAGR ?? 12.0,
    debtToEquity: de,
    currentRatio: cr,
    interestCoverage: ic,
    freeCashFlowCr: data.freeCashFlowCr ?? 15000,
    subScores: {
      valuation: valScore,
      profitability: profScore,
      growth: growScore,
      financialHealth: healthScore,
    },
    overallScore: total,
    sectorRanks: [
      { metric: "P/E Relative", value: `${pe}x`, percentile: pe < 25 ? 78 : 45 },
      { metric: "Return on Equity (ROE)", value: `${roe}%`, percentile: roe > 20 ? 88 : 62 },
      { metric: "Operating Margin", value: `${opMargin}%`, percentile: opMargin > 18 ? 82 : 55 },
      { metric: "Debt/Equity Leverage", value: `${de}x`, percentile: de < 0.5 ? 90 : 50 },
    ],
  };
}

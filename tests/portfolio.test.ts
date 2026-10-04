/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { optimizePortfolio, getSampleHoldings } from '../src/analysis/portfolio.ts';

describe('MPT Portfolio Optimizer Unit Tests', () => {
  const holdings = getSampleHoldings();

  it('Optimal weights sum to 100% (1.0)', () => {
    const minRisk = optimizePortfolio(holdings, 'MIN_RISK', 0.35);
    const totalWeight = Object.values(minRisk.optimalWeights).reduce((a, b) => a + b, 0);
    expect(Math.abs(totalWeight - 1.0)).toBeLessThan(0.01);
  });

  it('Single stock concentration caps are respected', () => {
    const cap = 0.25;
    const maxSharpe = optimizePortfolio(holdings, 'MAX_SHARPE', cap);
    for (const w of Object.values(maxSharpe.optimalWeights)) {
      expect(w).toBeLessThanOrEqual(cap + 0.001);
    }
  });

  it('MIN_RISK mode volatility is <= MAX_SHARPE mode volatility', () => {
    const minRisk = optimizePortfolio(holdings, 'MIN_RISK', 0.35);
    const maxSharpe = optimizePortfolio(holdings, 'MAX_SHARPE', 0.35);

    expect(minRisk.optimizedMetrics.volatility).toBeLessThanOrEqual(maxSharpe.optimizedMetrics.volatility);
  });
});

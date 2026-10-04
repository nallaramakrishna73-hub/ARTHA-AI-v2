/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { calculateBlackScholes, calculateFuturesFairValue, calculateBondPricing } from '../src/analysis/calculators.ts';

describe('Financial Calculators Unit Tests', () => {
  it('Black-Scholes Put-Call Parity holds (C - P = S*e^(-qT) - K*e^(-rT))', () => {
    const res = calculateBlackScholes({
      spotPrice: 2500,
      strikePrice: 2500,
      timeToExpiryYears: 0.25,
      riskFreeRate: 0.065,
      dividendYield: 0.01,
      volatility: 0.20,
      optionType: 'call',
    });

    expect(res.putCallParityCheck.isValid).toBe(true);
    expect(res.putCallParityCheck.difference).toBeLessThan(0.05);
  });

  it('Futures Fair Value correctly calculates cost of carry premium', () => {
    const fut = calculateFuturesFairValue(3000, 3020, 30, 0.065, 0.01);
    expect(fut.fairValue).toBeGreaterThan(3000);
    expect(fut.status).toBeDefined();
  });

  it('Bond Pricing Macaulay Duration decreases as coupon increases', () => {
    const bond1 = calculateBondPricing(1000, 0.05, 5, 2, 0.07);
    const bond2 = calculateBondPricing(1000, 0.10, 5, 2, 0.07);

    expect(bond2.macaulayDuration).toBeLessThan(bond1.macaulayDuration);
  });
});

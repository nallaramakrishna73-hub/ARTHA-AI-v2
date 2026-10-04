/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OptionsPricerParams,
  OptionsPricerResult,
  FuturesFairValueResult,
  BondCalculatorResult,
} from '../types/index.ts';

/**
 * Standard Normal cumulative distribution function (Abramowitz and Stegun approximation)
 */
export function cdfNormal(x: number): number {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.3989422804; // 1 / sqrt(2*pi)

  if (x >= 0.0) {
    const t = 1.0 / (1.0 + p * x);
    return 1.0 - c * Math.exp(-x * x / 2.0) * t *
      (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  } else {
    const t = 1.0 / (1.0 - p * x);
    return c * Math.exp(-x * x / 2.0) * t *
      (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  }
}

/**
 * Standard Normal probability density function
 */
export function pdfNormal(x: number): number {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

/**
 * Black-Scholes-Merton option pricing with continuous dividend yield
 */
export function calculateBlackScholes(params: OptionsPricerParams): OptionsPricerResult {
  const S = params.spotPrice;
  const K = params.strikePrice;
  const T = Math.max(0.0001, params.timeToExpiryYears);
  const r = params.riskFreeRate;
  const q = params.dividendYield;
  const sigma = Math.max(0.001, params.volatility);

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const Nd1 = cdfNormal(d1);
  const Nd2 = cdfNormal(d2);
  const N_neg_d1 = cdfNormal(-d1);
  const N_neg_d2 = cdfNormal(-d2);
  const pdf_d1 = pdfNormal(d1);

  const eqT = Math.exp(-q * T);
  const erT = Math.exp(-r * T);

  // Prices
  const callPrice = S * eqT * Nd1 - K * erT * Nd2;
  const putPrice = K * erT * N_neg_d2 - S * eqT * N_neg_d1;

  // Greeks
  const deltaCall = eqT * Nd1;
  const deltaPut = -eqT * N_neg_d1;
  const gamma = (eqT * pdf_d1) / (S * sigma * sqrtT);
  const vega = S * eqT * pdf_d1 * sqrtT * 0.01; // Per 1% vol change

  // Theta (per day)
  const term1 = -(S * sigma * eqT * pdf_d1) / (2 * sqrtT);
  const thetaCallYear = term1 - r * K * erT * Nd2 + q * S * eqT * Nd1;
  const thetaPutYear = term1 + r * K * erT * N_neg_d2 - q * S * eqT * N_neg_d1;
  const thetaCall = thetaCallYear / 365;
  const thetaPut = thetaPutYear / 365;

  // Rho (per 1% interest rate change)
  const rhoCall = K * T * erT * Nd2 * 0.01;
  const rhoPut = -K * T * erT * N_neg_d2 * 0.01;

  // Put-call parity test: Call - Put = S*e^(-qT) - K*e^(-rT)
  const lhs = callPrice - putPrice;
  const rhs = S * eqT - K * erT;
  const parityDiff = Math.abs(lhs - rhs);

  return {
    callPrice: Math.round(Math.max(0, callPrice) * 100) / 100,
    putPrice: Math.round(Math.max(0, putPrice) * 100) / 100,
    deltaCall: Math.round(deltaCall * 1000) / 1000,
    deltaPut: Math.round(deltaPut * 1000) / 1000,
    gamma: Math.round(gamma * 10000) / 10000,
    thetaCall: Math.round(thetaCall * 100) / 100,
    thetaPut: Math.round(thetaPut * 100) / 100,
    vega: Math.round(vega * 100) / 100,
    rhoCall: Math.round(rhoCall * 100) / 100,
    rhoPut: Math.round(rhoPut * 100) / 100,
    putCallParityCheck: {
      lhs: Math.round(lhs * 100) / 100,
      rhs: Math.round(rhs * 100) / 100,
      difference: Math.round(parityDiff * 10000) / 10000,
      isValid: parityDiff < 0.01,
    },
  };
}

/**
 * Cost of carry futures fair value
 * F = S * exp((r - q) * T)
 */
export function calculateFuturesFairValue(
  spotPrice: number,
  futuresMarketPrice: number,
  daysToExpiry: number,
  riskFreeRate: number = 0.065,
  dividendYield: number = 0.012
): FuturesFairValueResult {
  const T = Math.max(0.001, daysToExpiry / 365);
  const fairValue = spotPrice * Math.exp((riskFreeRate - dividendYield) * T);
  const basis = futuresMarketPrice - fairValue;
  const costOfCarryPct = ((fairValue - spotPrice) / spotPrice) * 100;

  const status = basis > 2 ? 'PREMIUM' : basis < -2 ? 'DISCOUNT' : 'FAIR';

  return {
    spotPrice,
    futuresMarketPrice,
    daysToExpiry,
    riskFreeRate,
    dividendYield,
    fairValue: Math.round(fairValue * 100) / 100,
    basis: Math.round(basis * 100) / 100,
    costOfCarryPct: Math.round(costOfCarryPct * 100) / 100,
    status,
  };
}

/**
 * Bond Pricing and Duration Calculator
 */
export function calculateBondPricing(
  faceValue: number = 1000,
  couponRate: number = 0.071, // 7.10%
  yearsToMaturity: number = 10,
  frequency: number = 2, // Semi-annual
  ytm: number = 0.0702 // 7.02% 10Y Indian benchmark
): BondCalculatorResult {
  const periods = yearsToMaturity * frequency;
  const couponPayment = (faceValue * couponRate) / frequency;
  const periodicYield = ytm / frequency;

  let bondPrice = 0;
  let weightedTimeSum = 0;
  let convexitySum = 0;

  for (let t = 1; t <= periods; t++) {
    const cashFlow = t === periods ? couponPayment + faceValue : couponPayment;
    const discountFactor = Math.pow(1 + periodicYield, t);
    const pv = cashFlow / discountFactor;

    bondPrice += pv;
    weightedTimeSum += (t / frequency) * pv;
    convexitySum += (t * (t + 1) / Math.pow(frequency, 2)) * pv;
  }

  const macaulayDuration = bondPrice > 0 ? weightedTimeSum / bondPrice : 0;
  const modifiedDuration = macaulayDuration / (1 + periodicYield);
  const convexity = bondPrice > 0 ? convexitySum / (bondPrice * Math.pow(1 + periodicYield, 2)) : 0;
  const dv01 = (bondPrice * modifiedDuration * 0.0001); // Dollar value of 1 basis point

  return {
    faceValue,
    couponRate,
    yearsToMaturity,
    frequency,
    ytm,
    bondPrice: Math.round(bondPrice * 100) / 100,
    macaulayDuration: Math.round(macaulayDuration * 100) / 100,
    modifiedDuration: Math.round(modifiedDuration * 100) / 100,
    convexity: Math.round(convexity * 100) / 100,
    dv01: Math.round(dv01 * 100) / 100,
  };
}

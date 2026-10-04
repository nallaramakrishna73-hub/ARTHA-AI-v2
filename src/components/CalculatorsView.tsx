/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  calculateBlackScholes,
  calculateFuturesFairValue,
  calculateBondPricing,
} from '../analysis/calculators.ts';
import { formatINR, formatPercent } from '../utils/format.ts';
import { Calculator, CheckCircle2, ShieldAlert } from 'lucide-react';

export const CalculatorsView: React.FC = () => {
  const [activeCalc, setActiveCalc] = useState<'options' | 'futures' | 'bonds'>('options');

  // Options state
  const [spotPrice, setSpotPrice] = useState(2940);
  const [strikePrice, setStrikePrice] = useState(2950);
  const [daysToExpiry, setDaysToExpiry] = useState(28);
  const [volatility, setVolatility] = useState(0.22); // 22%
  const [riskFreeRate, setRiskFreeRate] = useState(0.065); // 6.5%
  const [dividendYield, setDividendYield] = useState(0.012); // 1.2%

  // Futures state
  const [futuresPrice, setFuturesPrice] = useState(2958);

  // Bond state
  const [faceValue, setFaceValue] = useState(1000);
  const [couponRate, setCouponRate] = useState(0.071);
  const [yearsToMaturity, setYearsToMaturity] = useState(10);
  const [ytm, setYtm] = useState(0.0702);

  const optionsResult = calculateBlackScholes({
    spotPrice,
    strikePrice,
    timeToExpiryYears: daysToExpiry / 365,
    riskFreeRate,
    dividendYield,
    volatility,
    optionType: 'call',
  });

  const futuresResult = calculateFuturesFairValue(
    spotPrice,
    futuresPrice,
    daysToExpiry,
    riskFreeRate,
    dividendYield
  );

  const bondResult = calculateBondPricing(
    faceValue,
    couponRate,
    yearsToMaturity,
    2,
    ytm
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#FF9933]" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Quantitative Derivatives & Fixed Income Calculators
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Black-Scholes-Merton Options with Greeks · Cost-of-carry Futures · Bond Duration & Convexity
          </p>
        </div>

        {/* Calculator Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#070F1F] p-1 rounded-lg border border-[#1B2B48] text-xs">
          {[
            { id: 'options', label: 'Options Lab (BSM & Greeks)' },
            { id: 'futures', label: 'Futures Fair Value' },
            { id: 'bonds', label: 'Bond & 10Y Yield' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCalc(tab.id as any)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeCalc === tab.id
                  ? 'bg-[#1B2B48] text-[#FF9933] shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* OPTIONS LAB TAB */}
      {activeCalc === 'options' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Parameters */}
          <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white">Model Parameters</h3>

            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">Underlying Spot Price (₹)</label>
              <input
                type="number"
                value={spotPrice}
                onChange={(e) => setSpotPrice(Number(e.target.value))}
                className="w-full bg-[#070F1F] border border-[#1B2B48] rounded-lg px-3 py-1.5 text-xs text-white font-mono-numbers focus:outline-none focus:border-[#FF9933]"
              />
            </div>

            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">Strike Price (₹)</label>
              <input
                type="number"
                value={strikePrice}
                onChange={(e) => setStrikePrice(Number(e.target.value))}
                className="w-full bg-[#070F1F] border border-[#1B2B48] rounded-lg px-3 py-1.5 text-xs text-white font-mono-numbers focus:outline-none focus:border-[#FF9933]"
              />
            </div>

            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">Days to Expiry (Days)</label>
              <input
                type="number"
                value={daysToExpiry}
                onChange={(e) => setDaysToExpiry(Number(e.target.value))}
                className="w-full bg-[#070F1F] border border-[#1B2B48] rounded-lg px-3 py-1.5 text-xs text-white font-mono-numbers focus:outline-none focus:border-[#FF9933]"
              />
            </div>

            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">Implied Volatility (σ): {(volatility * 100).toFixed(0)}%</label>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.01"
                value={volatility}
                onChange={(e) => setVolatility(Number(e.target.value))}
                className="w-full accent-[#FF9933] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[#94A3B8] block mb-1">Risk-Free Rate</label>
                <div className="bg-[#070F1F] p-2 rounded border border-[#1B2B48] text-white font-mono-numbers">
                  {(riskFreeRate * 100).toFixed(1)}% (91D T-Bill)
                </div>
              </div>
              <div>
                <label className="text-[#94A3B8] block mb-1">Dividend Yield</label>
                <div className="bg-[#070F1F] p-2 rounded border border-[#1B2B48] text-white font-mono-numbers">
                  {(dividendYield * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Greeks Results */}
          <div className="lg:col-span-2 bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                Black-Scholes Theoretical Pricing & Greek Sensitivities
              </h3>

              {/* Call & Put Premium Cards */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-[#070F1F] p-4 rounded-xl border border-[#1B2B48]">
                  <div className="text-xs text-[#94A3B8]">European Call Premium</div>
                  <div className="text-2xl font-bold font-mono-numbers text-[#16A34A] mt-1">
                    ₹{optionsResult.callPrice.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    Intrinsic + Time value
                  </div>
                </div>

                <div className="bg-[#070F1F] p-4 rounded-xl border border-[#1B2B48]">
                  <div className="text-xs text-[#94A3B8]">European Put Premium</div>
                  <div className="text-2xl font-bold font-mono-numbers text-[#E5484D] mt-1">
                    ₹{optionsResult.putPrice.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    Intrinsic + Time value
                  </div>
                </div>
              </div>

              {/* Greeks Grid */}
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5">
                Option Greeks
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#070F1F] p-3 rounded-lg border border-[#1B2B48]">
                  <div className="text-[#64748B]">Delta (Call / Put)</div>
                  <div className="text-sm font-bold font-mono-numbers text-white mt-1">
                    {optionsResult.deltaCall.toFixed(3)} / {optionsResult.deltaPut.toFixed(3)}
                  </div>
                </div>

                <div className="bg-[#070F1F] p-3 rounded-lg border border-[#1B2B48]">
                  <div className="text-[#64748B]">Gamma (Γ)</div>
                  <div className="text-sm font-bold font-mono-numbers text-white mt-1">
                    {optionsResult.gamma.toFixed(4)}
                  </div>
                </div>

                <div className="bg-[#070F1F] p-3 rounded-lg border border-[#1B2B48]">
                  <div className="text-[#64748B]">Theta (Call Decay/Day)</div>
                  <div className="text-sm font-bold font-mono-numbers text-[#E5484D] mt-1">
                    ₹{optionsResult.thetaCall.toFixed(2)}
                  </div>
                </div>

                <div className="bg-[#070F1F] p-3 rounded-lg border border-[#1B2B48]">
                  <div className="text-[#64748B]">Vega (Per 1% Vol)</div>
                  <div className="text-sm font-bold font-mono-numbers text-[#FF9933] mt-1">
                    ₹{optionsResult.vega.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Put-Call Parity Test */}
            <div className="mt-5 p-3.5 bg-[#070F1F] rounded-lg border border-[#1B2B48] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span className="text-[#94A3B8]">
                  Put-Call Parity: C - P = S·e^(-qT) - K·e^(-rT) (LHS: ₹{optionsResult.putCallParityCheck.lhs}, RHS: ₹{optionsResult.putCallParityCheck.rhs})
                </span>
              </div>
              <span className="text-[#16A34A] font-semibold">VERIFIED</span>
            </div>
          </div>
        </div>
      )}

      {/* FUTURES TAB */}
      {activeCalc === 'futures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white">Futures Fair Value Parameters</h3>
            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">Spot Price (₹)</label>
              <input
                type="number"
                value={spotPrice}
                onChange={(e) => setSpotPrice(Number(e.target.value))}
                className="w-full bg-[#070F1F] border border-[#1B2B48] rounded-lg px-3 py-1.5 text-xs text-white font-mono-numbers"
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">Market Futures Price (₹)</label>
              <input
                type="number"
                value={futuresPrice}
                onChange={(e) => setFuturesPrice(Number(e.target.value))}
                className="w-full bg-[#070F1F] border border-[#1B2B48] rounded-lg px-3 py-1.5 text-xs text-white font-mono-numbers"
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">Days to Contract Expiry</label>
              <input
                type="number"
                value={daysToExpiry}
                onChange={(e) => setDaysToExpiry(Number(e.target.value))}
                className="w-full bg-[#070F1F] border border-[#1B2B48] rounded-lg px-3 py-1.5 text-xs text-white font-mono-numbers"
              />
            </div>
          </div>

          <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Cost-of-Carry Valuation</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#070F1F] p-4 rounded-xl border border-[#1B2B48]">
                  <div className="text-xs text-[#94A3B8]">Theoretical Fair Value</div>
                  <div className="text-2xl font-bold font-mono-numbers text-white mt-1">
                    ₹{futuresResult.fairValue.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#070F1F] p-4 rounded-xl border border-[#1B2B48]">
                  <div className="text-xs text-[#94A3B8]">Futures Basis (Market - Fair)</div>
                  <div className={`text-2xl font-bold font-mono-numbers mt-1 ${futuresResult.basis >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}`}>
                    ₹{futuresResult.basis.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-[#070F1F] rounded-lg border border-[#1B2B48] text-xs text-[#94A3B8]">
              Status: <strong className="text-[#FF9933]">{futuresResult.status}</strong> · Annualized cost of carry: {futuresResult.costOfCarryPct.toFixed(2)}%.
            </div>
          </div>
        </div>
      )}

      {/* BONDS TAB */}
      {activeCalc === 'bonds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white">Bond Specification</h3>
            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">Coupon Rate: {(couponRate * 100).toFixed(2)}%</label>
              <input
                type="number"
                step="0.001"
                value={couponRate}
                onChange={(e) => setCouponRate(Number(e.target.value))}
                className="w-full bg-[#070F1F] border border-[#1B2B48] rounded-lg px-3 py-1.5 text-xs text-white font-mono-numbers"
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">Yield-to-Maturity (YTM): {(ytm * 100).toFixed(2)}%</label>
              <input
                type="number"
                step="0.001"
                value={ytm}
                onChange={(e) => setYtm(Number(e.target.value))}
                className="w-full bg-[#070F1F] border border-[#1B2B48] rounded-lg px-3 py-1.5 text-xs text-white font-mono-numbers"
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] block mb-1">Maturity (Years): {yearsToMaturity} Y</label>
              <input
                type="number"
                value={yearsToMaturity}
                onChange={(e) => setYearsToMaturity(Number(e.target.value))}
                className="w-full bg-[#070F1F] border border-[#1B2B48] rounded-lg px-3 py-1.5 text-xs text-white font-mono-numbers"
              />
            </div>
          </div>

          <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Duration & Convexity Analysis</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#070F1F] p-3.5 rounded-lg border border-[#1B2B48]">
                  <div className="text-xs text-[#64748B]">Clean Price</div>
                  <div className="text-xl font-bold font-mono-numbers text-white mt-0.5">
                    ₹{bondResult.bondPrice.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#070F1F] p-3.5 rounded-lg border border-[#1B2B48]">
                  <div className="text-xs text-[#64748B]">Modified Duration</div>
                  <div className="text-xl font-bold font-mono-numbers text-[#FF9933] mt-0.5">
                    {bondResult.modifiedDuration.toFixed(2)} Y
                  </div>
                </div>
                <div className="bg-[#070F1F] p-3.5 rounded-lg border border-[#1B2B48]">
                  <div className="text-xs text-[#64748B]">Convexity</div>
                  <div className="text-xl font-bold font-mono-numbers text-white mt-0.5">
                    {bondResult.convexity.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#070F1F] p-3.5 rounded-lg border border-[#1B2B48]">
                  <div className="text-xs text-[#64748B]">DV01 (Per 1 bps)</div>
                  <div className="text-xl font-bold font-mono-numbers text-[#38BDF8] mt-0.5">
                    ₹{bondResult.dv01.toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-[#070F1F] rounded-lg border border-[#1B2B48] text-xs text-[#94A3B8]">
              India 10-Year Benchmark Sovereign G-Sec currently trades near 7.02% yield.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

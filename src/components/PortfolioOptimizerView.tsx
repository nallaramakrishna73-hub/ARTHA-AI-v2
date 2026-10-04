/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PortfolioHolding,
  PortfolioAnalytics,
  MptOptimizationResult,
  WhatIfScenarioResult,
} from '../types/index.ts';
import { optimizePortfolio, simulateWhatIfShock } from '../analysis/portfolio.ts';
import { formatINR, formatPercent, formatIndianNumber } from '../utils/format.ts';
import {
  Briefcase,
  PieChart,
  Sliders,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface PortfolioOptimizerViewProps {
  holdings: PortfolioHolding[];
  analytics: PortfolioAnalytics;
}

export const PortfolioOptimizerView: React.FC<PortfolioOptimizerViewProps> = ({
  holdings,
  analytics,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'holdings' | 'optimizer' | 'whatif' | 'correlation'>('holdings');
  const [optMode, setOptMode] = useState<'MIN_RISK' | 'MAX_SHARPE' | 'BALANCED'>('MAX_SHARPE');
  const [assetCap, setAssetCap] = useState<number>(0.30);
  const [marketShock, setMarketShock] = useState<number>(-10);

  // Run MPT optimization
  const optResult: MptOptimizationResult = optimizePortfolio(holdings, optMode, assetCap);

  // Run What-If simulation
  const shockResult: WhatIfScenarioResult = simulateWhatIfShock(holdings, marketShock);

  return (
    <div className="flex flex-col gap-6">
      {/* Portfolio Header Bar */}
      <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#FF9933]" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Portfolio Tracking & Modern Portfolio Theory (MPT) Optimizer
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Real-time Markowitz optimization · Ledoit-Wolf shrinkage covariance · What-if systemic stress tests
          </p>
        </div>

        {/* Sub-nav pills */}
        <div className="flex items-center gap-1 bg-[#070F1F] p-1 rounded-lg border border-[#1B2B48] text-xs">
          {[
            { id: 'holdings', label: 'Holdings & Allocation' },
            { id: 'optimizer', label: 'MPT Frontier Optimizer' },
            { id: 'whatif', label: 'What-If Shock Simulator' },
            { id: 'correlation', label: 'Correlation Heatmap' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === tab.id
                  ? 'bg-[#1B2B48] text-[#FF9933] shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-4">
          <div className="text-xs text-[#94A3B8]">Total Portfolio Value</div>
          <div className="text-xl font-bold font-mono-numbers text-white mt-1">
            {formatINR(analytics.totalValue)}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            Invested: {formatINR(analytics.totalInvested)}
          </div>
        </div>

        <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-4">
          <div className="text-xs text-[#94A3B8]">Unrealized P&L</div>
          <div className="text-xl font-bold font-mono-numbers text-[#16A34A] mt-1">
            +{formatINR(analytics.totalPnL)}
          </div>
          <div className="text-[11px] text-[#16A34A] font-semibold mt-0.5">
            {formatPercent(analytics.totalPnLPercent)} Return
          </div>
        </div>

        <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-4">
          <div className="text-xs text-[#94A3B8]">Portfolio Beta</div>
          <div className="text-xl font-bold font-mono-numbers text-[#FF9933] mt-1">
            {analytics.portfolioBeta}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            vs NIFTY 50 benchmark
          </div>
        </div>

        <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-4">
          <div className="text-xs text-[#94A3B8]">Annualized Volatility</div>
          <div className="text-xl font-bold font-mono-numbers text-white mt-1">
            {analytics.annualizedVol}%
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            252 trading-day scale
          </div>
        </div>

        <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-4">
          <div className="text-xs text-[#94A3B8]">Sharpe Ratio</div>
          <div className="text-xl font-bold font-mono-numbers text-[#38BDF8] mt-1">
            {analytics.sharpeRatio}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">
            Hurdle rate: 6.5% G-Sec
          </div>
        </div>
      </div>

      {/* SUBTAB 1: HOLDINGS & ALLOCATION */}
      {activeSubTab === 'holdings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holdings Table */}
          <div className="lg:col-span-2 bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-4">Current Equity Holdings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#1B2B48] text-[#64748B] uppercase tracking-wider">
                    <th className="pb-2 font-semibold">Security</th>
                    <th className="pb-2 font-semibold">Qty</th>
                    <th className="pb-2 font-semibold">Avg Buy</th>
                    <th className="pb-2 font-semibold">LTP</th>
                    <th className="pb-2 font-semibold">Current Value</th>
                    <th className="pb-2 font-semibold">P&L</th>
                    <th className="pb-2 font-semibold text-right">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B2B48] text-[#CBD5E1]">
                  {holdings.map(h => (
                    <tr key={h.id}>
                      <td className="py-3">
                        <div className="font-bold text-white">{h.symbol}</div>
                        <div className="text-[10px] text-[#64748B] truncate max-w-[120px]">{h.sector}</div>
                      </td>
                      <td className="py-3 font-mono-numbers">{h.quantity}</td>
                      <td className="py-3 font-mono-numbers">{formatINR(h.avgBuyPrice)}</td>
                      <td className="py-3 font-mono-numbers font-medium text-white">{formatINR(h.currentPrice)}</td>
                      <td className="py-3 font-mono-numbers font-semibold text-white">{formatINR(h.currentValue)}</td>
                      <td className="py-3 font-mono-numbers">
                        <span className={h.pnl >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}>
                          {formatPercent(h.pnlPercent)}
                        </span>
                      </td>
                      <td className="py-3 font-mono-numbers text-right font-bold text-[#FF9933]">
                        {h.weightPct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sector Exposure & Concentration */}
          <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Sector Allocation & HHI</h3>
              <div className="space-y-3">
                {analytics.sectorExposure.map(s => (
                  <div key={s.sector} className="text-xs">
                    <div className="flex items-center justify-between text-[#94A3B8] mb-1">
                      <span>{s.sector}</span>
                      <span className="font-bold font-mono-numbers text-white">{s.weightPct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[#172A46] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF9933] rounded-full"
                        style={{ width: `${s.weightPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-3 bg-[#070F1F] rounded-lg border border-[#1B2B48] text-xs text-[#94A3B8]">
              <div className="font-semibold text-white mb-1">Concentration Diagnostics:</div>
              <ul className="space-y-1 list-disc list-inside">
                {analytics.insights.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MPT FRONTIER OPTIMIZER */}
      {activeSubTab === 'optimizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls & Allocation Diff */}
          <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white">Optimization Parameters</h3>

            <div>
              <label className="text-xs text-[#94A3B8] block mb-1.5 font-medium">Optimization Mode</label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#070F1F] p-1 rounded-lg border border-[#1B2B48] text-xs">
                {(['MAX_SHARPE', 'MIN_RISK', 'BALANCED'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setOptMode(m)}
                    className={`py-1.5 rounded font-semibold text-[11px] transition-colors ${
                      optMode === m ? 'bg-[#1B2B48] text-[#FF9933]' : 'text-[#64748B] hover:text-white'
                    }`}
                  >
                    {m === 'MAX_SHARPE' ? 'Max Sharpe' : m === 'MIN_RISK' ? 'Min Vol' : 'Balanced'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
                <span>Per-Asset Max Cap</span>
                <span className="font-mono-numbers font-bold text-white">{(assetCap * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.50"
                step="0.05"
                value={assetCap}
                onChange={(e) => setAssetCap(Number(e.target.value))}
                className="w-full accent-[#FF9933] cursor-pointer"
              />
            </div>

            {/* Before vs After Allocation */}
            <div className="mt-2 pt-4 border-t border-[#1B2B48]">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Rebalancing Target Weights
              </h4>
              <div className="space-y-2.5">
                {holdings.map(h => {
                  const currW = (optResult.currentWeights[h.symbol] || 0) * 100;
                  const optW = (optResult.optimalWeights[h.symbol] || 0) * 100;
                  const delta = optW - currW;
                  return (
                    <div key={h.symbol} className="bg-[#070F1F] p-2.5 rounded-lg border border-[#1B2B48] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{h.symbol}</span>
                        <div className="flex items-center gap-2 font-mono-numbers">
                          <span className="text-[#64748B]">{currW.toFixed(1)}%</span>
                          <ArrowRight className="w-3 h-3 text-[#94A3B8]" />
                          <span className="font-bold text-[#FF9933]">{optW.toFixed(1)}%</span>
                          <span className={`text-[10px] ${delta >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}`}>
                            ({delta >= 0 ? '+' : ''}{delta.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Efficient Frontier Curve (SVG) & Metrics */}
          <div className="lg:col-span-2 bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">
                  Markowitz Efficient Frontier (30 Discrete Portfolios)
                </h3>
                <span className="text-xs text-[#94A3B8] font-mono">
                  Current (★) vs Optimal (▲)
                </span>
              </div>

              {/* SVG Frontier Plot */}
              <div className="w-full bg-[#070F1F] rounded-lg border border-[#1B2B48] p-3">
                <svg className="w-full h-56" viewBox="0 0 600 220" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75].map(ratio => (
                    <line
                      key={ratio}
                      x1="40"
                      y1={220 * ratio}
                      x2="580"
                      y2={220 * ratio}
                      stroke="#172A46"
                      strokeDasharray="3 3"
                    />
                  ))}

                  {/* Frontier Curve Path */}
                  {(() => {
                    const minV = 11.5;
                    const maxV = 22.0;
                    const minR = 10.0;
                    const maxR = 21.0;

                    const points = optResult.efficientFrontier.map(pt => {
                      const x = 50 + ((pt.volatility - minV) / (maxV - minV)) * 510;
                      const y = 200 - ((pt.return - minR) / (maxR - minR)) * 170;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <>
                        <polyline points={points} fill="none" stroke="#FF9933" strokeWidth="2.5" />
                        {/* Current portfolio star */}
                        <circle cx="280" cy="95" r="6" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
                        <text x="290" y="99" fill="#38BDF8" fontSize="10" fontFamily="Inter" fontWeight="bold">
                          Current ({optResult.currentMetrics.volatility}% Vol, {optResult.currentMetrics.expectedReturn}% Ret)
                        </text>

                        {/* Optimized portfolio marker */}
                        <polygon points="220,70 214,82 226,82" fill="#16A34A" />
                        <text x="230" y="79" fill="#16A34A" fontSize="10" fontFamily="Inter" fontWeight="bold">
                          Optimized ({optResult.optimizedMetrics.volatility}% Vol, {optResult.optimizedMetrics.expectedReturn}% Ret)
                        </text>
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>

            {/* Before / After Metrics Row */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#1B2B48] text-xs">
              <div className="p-3 bg-[#070F1F] rounded-lg border border-[#1B2B48]">
                <div className="text-[#64748B]">Expected Return</div>
                <div className="text-base font-bold font-mono-numbers text-white mt-0.5">
                  {optResult.optimizedMetrics.expectedReturn}%
                </div>
                <div className="text-[10px] text-[#16A34A]">
                  +{Math.abs(optResult.optimizedMetrics.expectedReturn - optResult.currentMetrics.expectedReturn).toFixed(1)}% vs Current
                </div>
              </div>

              <div className="p-3 bg-[#070F1F] rounded-lg border border-[#1B2B48]">
                <div className="text-[#64748B]">Expected Volatility</div>
                <div className="text-base font-bold font-mono-numbers text-white mt-0.5">
                  {optResult.optimizedMetrics.volatility}%
                </div>
                <div className="text-[10px] text-[#16A34A]">
                  -{(optResult.currentMetrics.volatility - optResult.optimizedMetrics.volatility).toFixed(1)}% Risk Reduction
                </div>
              </div>

              <div className="p-3 bg-[#070F1F] rounded-lg border border-[#1B2B48]">
                <div className="text-[#64748B]">Sharpe Ratio</div>
                <div className="text-base font-bold font-mono-numbers text-[#FF9933] mt-0.5">
                  {optResult.optimizedMetrics.sharpeRatio}
                </div>
                <div className="text-[10px] text-[#38BDF8]">
                  From {optResult.currentMetrics.sharpeRatio} baseline
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: WHAT-IF SHOCK SIMULATOR */}
      {activeSubTab === 'whatif' && (
        <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-semibold text-white">Systemic Market Shock Simulator</h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              Simulate broad NIFTY 50 index corrections or rallies; impact is computed asset-by-asset via: Impact = Σ(w_i × β_i) × Market Shock.
            </p>
          </div>

          {/* Slider Controls */}
          <div className="bg-[#070F1F] p-4 rounded-xl border border-[#1B2B48] flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">NIFTY 50 Shock Magnitude:</span>
              <span className={`text-base font-bold font-mono-numbers ${marketShock >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}`}>
                {formatPercent(marketShock)}
              </span>
            </div>

            <input
              type="range"
              min="-25"
              max="25"
              step="1"
              value={marketShock}
              onChange={(e) => setMarketShock(Number(e.target.value))}
              className="w-full accent-[#FF9933] cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono-numbers">
              <span>-25% (Bear Crash)</span>
              <span>-10% (Correction)</span>
              <span>0% (Neutral)</span>
              <span>+10% (Bull Rally)</span>
              <span>+25% (Euphoria)</span>
            </div>
          </div>

          {/* Impact Results Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#070F1F] p-4 rounded-xl border border-[#1B2B48]">
              <div className="text-xs text-[#94A3B8]">Portfolio Delta (%)</div>
              <div className={`text-2xl font-bold font-mono-numbers mt-1 ${shockResult.portfolioImpactPercent >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}`}>
                {formatPercent(shockResult.portfolioImpactPercent)}
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                Effective portfolio beta sensitivity
              </div>
            </div>

            <div className="bg-[#070F1F] p-4 rounded-xl border border-[#1B2B48]">
              <div className="text-xs text-[#94A3B8]">Capital Impact (INR)</div>
              <div className={`text-2xl font-bold font-mono-numbers mt-1 ${shockResult.portfolioImpactINR >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}`}>
                {formatINR(shockResult.portfolioImpactINR)}
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                Projected dollar value swing
              </div>
            </div>

            <div className="bg-[#070F1F] p-4 rounded-xl border border-[#1B2B48]">
              <div className="text-xs text-[#94A3B8]">Projected Portfolio Value</div>
              <div className="text-2xl font-bold font-mono-numbers text-white mt-1">
                {formatINR(shockResult.projectedPortfolioValue)}
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                Post-shock valuation
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1B2B48] text-[#64748B] uppercase tracking-wider">
                  <th className="pb-2 font-semibold">Symbol</th>
                  <th className="pb-2 font-semibold">Weight</th>
                  <th className="pb-2 font-semibold">Beta</th>
                  <th className="pb-2 font-semibold">Asset Shock</th>
                  <th className="pb-2 font-semibold text-right">Value Impact (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B2B48] text-[#CBD5E1]">
                {shockResult.stockImpacts.map(item => (
                  <tr key={item.symbol}>
                    <td className="py-2.5 font-bold text-white">{item.symbol}</td>
                    <td className="py-2.5 font-mono-numbers">{item.weight}%</td>
                    <td className="py-2.5 font-mono-numbers text-[#FF9933]">{item.beta}</td>
                    <td className="py-2.5 font-mono-numbers">
                      <span className={item.priceShockPercent >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}>
                        {formatPercent(item.priceShockPercent)}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono-numbers text-right font-semibold">
                      <span className={item.valueLossINR >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}>
                        {formatINR(item.valueLossINR)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: CORRELATION HEATMAP */}
      {activeSubTab === 'correlation' && (
        <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-4">Inter-Asset Correlation Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border border-[#1B2B48] text-left text-[#64748B]">Asset</th>
                  {analytics.correlationMatrix.symbols.map(s => (
                    <th key={s} className="p-2 border border-[#1B2B48] font-bold text-white font-mono">
                      {s.replace('.NS', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analytics.correlationMatrix.symbols.map((sym, i) => (
                  <tr key={sym}>
                    <td className="p-2 border border-[#1B2B48] text-left font-bold text-white font-mono">
                      {sym.replace('.NS', '')}
                    </td>
                    {analytics.correlationMatrix.matrix[i].map((val, j) => {
                      const isDiag = i === j;
                      const bg = isDiag
                        ? 'bg-[#172A46]'
                        : val > 0.6
                        ? 'bg-[#E5484D]/30 text-[#E5484D]'
                        : val > 0.3
                        ? 'bg-[#FF9933]/20 text-[#FF9933]'
                        : 'bg-[#16A34A]/20 text-[#16A34A]';
                      return (
                        <td
                          key={j}
                          className={`p-2.5 border border-[#1B2B48] font-mono-numbers font-medium ${bg}`}
                        >
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-[11px] text-[#64748B]">
            Low correlation (&lt; 0.40) provides structural diversification benefits under Markowitz framework.
          </div>
        </div>
      )}
    </div>
  );
};

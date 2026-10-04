/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ResearchReport } from '../types/index.ts';
import { formatINR, formatPercent } from '../utils/format.ts';
import { Scale, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';

interface CompareViewProps {
  report1: ResearchReport;
  report2: ResearchReport;
  onSelectStock1: (sym: string) => void;
  onSelectStock2: (sym: string) => void;
  availableSymbols: string[];
}

export const CompareView: React.FC<CompareViewProps> = ({
  report1,
  report2,
  onSelectStock1,
  onSelectStock2,
  availableSymbols,
}) => {
  const radarCategories = [
    { name: 'Technical Structure', key: 'technical' as const },
    { name: 'Fundamental Quality', key: 'fundamental' as const },
    { name: 'FinBERT Sentiment', key: 'sentiment' as const },
    { name: 'Risk Resilience', key: 'riskResilience' as const },
    { name: 'Macro Tailwind', key: 'macro' as const },
  ];

  const s1Total = report1.scores.overall;
  const s2Total = report2.scores.overall;
  const higherSym = s1Total >= s2Total ? report1.symbol : report2.symbol;
  const delta = Math.abs(s1Total - s2Total);

  return (
    <div className="flex flex-col gap-6">
      {/* Compare Header & Selector Row */}
      <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#FF9933]" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Dual-Stock Comparative Research & Radar Evaluation
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Side-by-side factor benchmarking across NSE/BSE equities · Non-advice research analysis
          </p>
        </div>

        {/* Dropdown Selectors */}
        <div className="flex items-center gap-3">
          <select
            value={report1.symbol}
            onChange={(e) => onSelectStock1(e.target.value)}
            className="bg-[#070F1F] border border-[#1B2B48] text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#FF9933]"
          >
            {!availableSymbols.includes(report1.symbol) && (
              <option value={report1.symbol}>{report1.symbol}</option>
            )}
            {availableSymbols.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>

          <span className="text-[#FF9933] font-bold text-xs">VS</span>

          <select
            value={report2.symbol}
            onChange={(e) => onSelectStock2(e.target.value)}
            className="bg-[#070F1F] border border-[#1B2B48] text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#FF9933]"
          >
            {!availableSymbols.includes(report2.symbol) && (
              <option value={report2.symbol}>{report2.symbol}</option>
            )}
            {availableSymbols.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Cards Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Stock 1 Summary Card */}
        <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{report1.companyName}</h3>
                <span className="text-xs text-[#94A3B8]">{report1.symbol} · {report1.sector}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono-numbers text-white">
                  {formatINR(report1.quote.price)}
                </div>
                <div className={`text-xs font-semibold ${report1.quote.changePercent >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}`}>
                  {formatPercent(report1.quote.changePercent)}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1B2B48] flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Composite Analytical Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono-numbers text-[#FF9933]">
                  {report1.scores.overall}
                </span>
                <span className="text-xs text-[#64748B]">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock 2 Summary Card */}
        <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{report2.companyName}</h3>
                <span className="text-xs text-[#94A3B8]">{report2.symbol} · {report2.sector}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono-numbers text-white">
                  {formatINR(report2.quote.price)}
                </div>
                <div className={`text-xs font-semibold ${report2.quote.changePercent >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}`}>
                  {formatPercent(report2.quote.changePercent)}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1B2B48] flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Composite Analytical Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono-numbers text-[#38BDF8]">
                  {report2.scores.overall}
                </span>
                <span className="text-xs text-[#64748B]">/ 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Multi-Factor Radar & Bar Breakdown */}
      <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-[#1B2B48] mb-4">
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Sub-Score Factor Breakdown Comparison
          </h3>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-[#FF9933]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933]" />
              {report1.symbol}
            </span>
            <span className="flex items-center gap-1.5 text-[#38BDF8]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
              {report2.symbol}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {radarCategories.map(cat => {
            const v1 = report1.scores[cat.key];
            const v2 = report2.scores[cat.key];
            return (
              <div key={cat.key} className="bg-[#070F1F] p-3 rounded-lg border border-[#1B2B48]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-white">{cat.name}</span>
                  <div className="flex items-center gap-4 font-mono-numbers">
                    <span className="text-[#FF9933] font-bold">{v1} pts</span>
                    <span className="text-[#64748B]">vs</span>
                    <span className="text-[#38BDF8] font-bold">{v2} pts</span>
                  </div>
                </div>

                {/* Comparative Dual Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-[#172A46] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF9933] rounded-full transition-all duration-700"
                      style={{ width: `${v1}%` }}
                    />
                  </div>
                  <div className="w-full bg-[#172A46] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#38BDF8] rounded-full transition-all duration-700"
                      style={{ width: `${v2}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Metrics Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#1B2B48] text-[#64748B] uppercase tracking-wider">
                <th className="pb-2 font-semibold">Financial & Risk Metric</th>
                <th className="pb-2 font-semibold text-[#FF9933]">{report1.symbol}</th>
                <th className="pb-2 font-semibold text-[#38BDF8]">{report2.symbol}</th>
                <th className="pb-2 font-semibold text-right">Comparative Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2B48] text-[#CBD5E1]">
              <tr>
                <td className="py-2.5">Trailing P/E Multiple</td>
                <td className="font-mono-numbers">{report1.fundamental.peRatio}x</td>
                <td className="font-mono-numbers">{report2.fundamental.peRatio}x</td>
                <td className="text-right font-medium text-white">
                  {report1.fundamental.peRatio < report2.fundamental.peRatio ? report1.symbol : report2.symbol} (Lower Multiple)
                </td>
              </tr>
              <tr>
                <td className="py-2.5">Return on Equity (ROE)</td>
                <td className="font-mono-numbers text-[#16A34A]">{report1.fundamental.roe}%</td>
                <td className="font-mono-numbers text-[#16A34A]">{report2.fundamental.roe}%</td>
                <td className="text-right font-medium text-white">
                  {report1.fundamental.roe > report2.fundamental.roe ? report1.symbol : report2.symbol} (Higher Return)
                </td>
              </tr>
              <tr>
                <td className="py-2.5">Annualized Volatility</td>
                <td className="font-mono-numbers">{report1.risk.annualizedVolatility}%</td>
                <td className="font-mono-numbers">{report2.risk.annualizedVolatility}%</td>
                <td className="text-right font-medium text-white">
                  {report1.risk.annualizedVolatility < report2.risk.annualizedVolatility ? report1.symbol : report2.symbol} (Lower Vol)
                </td>
              </tr>
              <tr>
                <td className="py-2.5">Beta vs NIFTY 50</td>
                <td className="font-mono-numbers">{report1.risk.betaVsNifty}</td>
                <td className="font-mono-numbers">{report2.risk.betaVsNifty}</td>
                <td className="text-right font-medium text-white">
                  {Math.abs(report1.risk.betaVsNifty - 1) < Math.abs(report2.risk.betaVsNifty - 1) ? report1.symbol : report2.symbol} (Market Coherence)
                </td>
              </tr>
              <tr>
                <td className="py-2.5">RSI (14) Momentum</td>
                <td className="font-mono-numbers">{report1.technical.rsi14}</td>
                <td className="font-mono-numbers">{report2.technical.rsi14}</td>
                <td className="text-right font-medium text-white">
                  {report1.technical.rsi14 > report2.technical.rsi14 ? `${report1.symbol} (Stronger)` : `${report2.symbol} (Stronger)`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Analytical Research Synthesis */}
        <div className="mt-5 p-4 rounded-lg bg-[#070F1F] border border-[#1B2B48] flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#FF9933] shrink-0 mt-0.5" />
          <div className="text-xs text-[#94A3B8] leading-relaxed">
            <span className="font-semibold text-white block mb-1">
              Comparative Quantitative Synthesis:
            </span>
            {report1.companyName} ({report1.symbol}: Score {report1.scores.overall}/100) vs {report2.companyName} ({report2.symbol}: Score {report2.scores.overall}/100) reveals a score delta of {delta} points. While {higherSym} holds a composite edge based on current weighted parameters, both counters exhibit distinct risk-return trade-offs. This analysis is deterministic and purely educational. No buy/sell preference is implied.
          </div>
        </div>
      </div>
    </div>
  );
};

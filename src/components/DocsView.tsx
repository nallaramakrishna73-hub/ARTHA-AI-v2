/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Code2, Check, FileCheck, Layers, GitBranch } from 'lucide-react';
import { DISCLAIMER_TEXT } from '../config/index.ts';

export const DocsView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#FF9933]" />
          <h2 className="text-base font-bold text-white tracking-wide">
            ARTHA AI · Project Blueprint & Technical Architecture Documentation
          </h2>
        </div>
        <p className="text-xs text-[#94A3B8] mt-1">
          Capabl Financial Research AI Agent Development Project (Track B Advanced) · Author: Ramakrishna Janhvi
        </p>
      </div>

      {/* Core Technical Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#FF9933] font-bold mb-2">
            <Cpu className="w-4 h-4" />
            <span>Agentic Orchestration</span>
          </div>
          <p className="text-[#94A3B8] leading-relaxed">
            LangGraph-style 12-node pipeline with intent planning, parallel data fan-out, deterministic indicator engine, strict number validation, and SEBI compliance filter.
          </p>
        </div>

        <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#16A34A] font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Hallucination Guarantee</span>
          </div>
          <p className="text-[#94A3B8] leading-relaxed">
            All numerical figures (P/E, RSI, VaR, Volatility, Price) are computed by deterministic tools before being passed to LLM synthesizer. The NumberValidator rejects ungrounded figures.
          </p>
        </div>

        <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#38BDF8] font-bold mb-2">
            <Layers className="w-4 h-4" />
            <span>MPT & Risk Engine</span>
          </div>
          <p className="text-[#94A3B8] leading-relaxed">
            Modern Portfolio Theory with Ledoit-Wolf shrinkage covariance, efficient frontier generation, 95% historical & parametric VaR/CVaR, and what-if market shock simulation.
          </p>
        </div>
      </div>

      {/* Architecture Data Flow Section */}
      <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col gap-4 text-xs leading-relaxed">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-[#FF9933]" />
          Agent Execution & Data-Flow Pipeline
        </h3>

        <div className="p-4 bg-[#070F1F] rounded-lg border border-[#1B2B48] font-mono text-[11px] text-[#CBD5E1] space-y-2 overflow-x-auto">
          <div>[User Request] &quot;Analyze RELIANCE.NS&quot;</div>
          <div className="text-[#FF9933]">  ↓ 1. ResearchPlanner Node (intent analysis, symbol resolution, tool selection)</div>
          <div className="text-[#38BDF8]">  ↓ 2. Parallel Data Fan-Out:</div>
          <div className="pl-6 text-[#94A3B8]">
            ├── MarketDataNode (180D OHLCV series, live quote, session status)<br />
            ├── FundamentalNode (balance sheet, P/E, P/B, ROE, debt leverage)<br />
            ├── NewsSentimentNode (FinBERT probabilities, recency decay, 7d momentum)<br />
            └── MacroNode (RBI repo rate 6.5%, CPI 5.12%, GDP 7.4%, sector sensitivity)
          </div>
          <div className="text-[#16A34A]">  ↓ 3. Quantitative Analysis Engines:</div>
          <div className="pl-6 text-[#94A3B8]">
            ├── TechnicalNode (Wilder RSI(14), MACD(12,26,9), Bollinger Bands, S/R pivots)<br />
            └── RiskNode (daily log returns, annualized vol, beta vs NIFTY, 95% VaR, CVaR, Sharpe)
          </div>
          <div className="text-[#A855F7]">  ↓ 4. ScoringNode (5-pillar composite 0-100 analytical score)</div>
          <div className="text-[#EAB308]">  ↓ 5. ResearchSynthesizer Node (evidence-grounded structured dossier generation)</div>
          <div className="text-[#F43F5E]">  ↓ 6. NumberValidator Node (cross-checks every number in draft against evidence)</div>
          <div className="text-[#10B981]">  ↓ 7. ComplianceChecker Node (SEBI non-advice validation, blocks buy/sell, appends disclaimer)</div>
          <div className="text-white font-bold">  ↓ 8. Final Report Assembly & PDF Generator (13 structured sections)</div>
        </div>
      </div>

      {/* Mathematical Formulations Table */}
      <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col gap-4 text-xs">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#FF9933]" />
          Deterministic Mathematical Formulations Implemented
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1B2B48] text-[#64748B] uppercase tracking-wider">
                <th className="pb-2 font-semibold">Engine</th>
                <th className="pb-2 font-semibold">Indicator / Metric</th>
                <th className="pb-2 font-semibold">Mathematical Formula</th>
                <th className="pb-2 font-semibold">Parameters / Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2B48] text-[#CBD5E1]">
              <tr>
                <td className="py-2.5 font-bold text-white">Technical</td>
                <td>RSI (Wilder)</td>
                <td className="font-mono text-[11px]">100 - (100 / (1 + AvgGain/AvgLoss))</td>
                <td>Period 14, α = 1/14 Wilder smoothing</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Technical</td>
                <td>Bollinger Bands</td>
                <td className="font-mono text-[11px]">SMA(20) ± 2 · σ(20)</td>
                <td>Period 20, 2 Standard Deviations</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Risk</td>
                <td>Annualized Volatility</td>
                <td className="font-mono text-[11px]">std(r_t) · sqrt(252)</td>
                <td>Log daily returns r_t = ln(P_t / P_(t-1))</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Risk</td>
                <td>Beta vs NIFTY 50</td>
                <td className="font-mono text-[11px]">cov(r_stock, r_NIFTY) / var(r_NIFTY)</td>
                <td>180-day rolling daily returns</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Risk</td>
                <td>Historical VaR 95%</td>
                <td className="font-mono text-[11px]">-percentile(r_t, 5)</td>
                <td>1-Day horizon at 95% confidence</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Derivatives</td>
                <td>Black-Scholes-Merton</td>
                <td className="font-mono text-[11px]">C = S·e^(-qT)·N(d1) - K·e^(-rT)·N(d2)</td>
                <td>Continuous dividend yield q, Indian T-Bill r</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">Portfolio</td>
                <td>What-If Shock</td>
                <td className="font-mono text-[11px]">Impact = Σ(w_i · β_i) · Market Shock · Value</td>
                <td>Portfolio Beta sensitivity mapping</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Viva Q&A & Compliance Notes */}
      <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col gap-3 text-xs leading-relaxed">
        <h3 className="text-sm font-semibold text-white">
          Viva Presentation & Academic Evaluation Notes
        </h3>
        <p className="text-[#94A3B8]">
          <strong className="text-white">Why LangGraph instead of a single LLM prompt? </strong>
          Deterministic orchestration guarantees reproducibility, testability, and separation of concerns. The LLM is used solely for narrative synthesis; all indicators, risk measures, and optimization weights are computed deterministically.
        </p>
        <p className="text-[#94A3B8]">
          <strong className="text-white">Is ARTHA AI an investment advisory tool? </strong>
          No. Under SEBI (Research Analysts) Regulations, personalized advice or price targets require registration. ARTHA AI operates exclusively as an educational, quantitative analytics platform with visible sub-score weights and mandatory disclaimers.
        </p>
      </div>
    </div>
  );
};

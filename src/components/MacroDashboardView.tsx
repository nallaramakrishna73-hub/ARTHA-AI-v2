/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MacroIndicator, MacroAnalysisResult } from '../types/index.ts';
import { Landmark, TrendingUp, TrendingDown, Layers, HelpCircle } from 'lucide-react';
import { SECTOR_MAPPING } from '../config/index.ts';

interface MacroDashboardViewProps {
  indicators: MacroIndicator[];
  analysis: MacroAnalysisResult;
}

export const MacroDashboardView: React.FC<MacroDashboardViewProps> = ({
  indicators,
  analysis,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('Information Technology');

  const sectorData = SECTOR_MAPPING[selectedSector] || {
    rateSensitivity: 'MODERATE',
    fxSensitivity: 'NEUTRAL',
    inflationSensitivity: 'RESILIENT',
    description: 'Tracks broader domestic consumption and fixed capital formation.',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-[#FF9933]" />
          <h2 className="text-base font-bold text-white tracking-wide">
            India Sovereign Macroeconomic Radar & Sector Transmission
          </h2>
        </div>
        <p className="text-xs text-[#94A3B8] mt-1">
          MoSPI, RBI, and CCIL benchmark economic series · Evaluates transmission channels into sector valuations
        </p>
      </div>

      {/* 6 Key Macro Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map(ind => (
          <div
            key={ind.id}
            className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-4 shadow-lg flex flex-col justify-between hover:border-[#2D436B] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span className="font-semibold text-white">{ind.name}</span>
                <span className="font-mono-numbers text-[10px] text-[#64748B]">
                  {ind.unit}
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-3">
                <span className="text-3xl font-bold font-mono-numbers text-white">
                  {ind.currentValue.toFixed(2)}
                  <span className="text-sm font-normal text-[#94A3B8] ml-1">{ind.unit}</span>
                </span>
                {ind.change !== 0 && (
                  <span
                    className={`flex items-center text-xs font-semibold ${
                      ind.change > 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'
                    }`}
                  >
                    {ind.change > 0 ? '+' : ''}{ind.change.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div>
              {ind.rbiTarget && (
                <div className="text-[11px] text-[#FF9933] font-mono-numbers mb-1">
                  Target / Stance: {ind.rbiTarget}
                </div>
              )}
              <div className="text-[11px] text-[#64748B] leading-relaxed">
                {ind.description}
              </div>
              <div className="text-[10px] text-[#475569] mt-2 pt-2 border-t border-[#1B2B48]">
                Source: {ind.lastUpdated}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sector Sensitivity Interactive Simulator */}
      <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1B2B48]">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Sector Transmission & Policy Sensitivity Analysis
            </h3>
            <span className="text-xs text-[#94A3B8]">
              Select an industry group to inspect interest rate, currency, and input inflation sensitivities.
            </span>
          </div>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-[#070F1F] border border-[#1B2B48] text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#FF9933]"
          >
            {Object.keys(SECTOR_MAPPING).map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>

        {/* Selected Sector Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#070F1F] p-4 rounded-lg border border-[#1B2B48]">
            <div className="text-xs text-[#94A3B8]">Interest Rate Sensitivity</div>
            <div className="text-base font-bold text-white mt-1">
              {sectorData.rateSensitivity.replace('_', ' ')}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1">
              Impact of RBI repo rate changes on cost of debt and capital expenditure.
            </div>
          </div>

          <div className="bg-[#070F1F] p-4 rounded-lg border border-[#1B2B48]">
            <div className="text-xs text-[#94A3B8]">FX / USD-INR Sensitivity</div>
            <div className="text-base font-bold text-[#16A34A] mt-1">
              {sectorData.fxSensitivity}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1">
              Net foreign exchange realization and input import bill elasticity.
            </div>
          </div>

          <div className="bg-[#070F1F] p-4 rounded-lg border border-[#1B2B48]">
            <div className="text-xs text-[#94A3B8]">Inflation Pass-Through</div>
            <div className="text-base font-bold text-[#FF9933] mt-1">
              {sectorData.inflationSensitivity}
            </div>
            <div className="text-[11px] text-[#64748B] mt-1">
              Ability to transmit wholesale raw material price inflation into end customer pricing.
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#070F1F] rounded-lg border border-[#1B2B48] text-xs text-[#CBD5E1] leading-relaxed">
          <strong className="text-white">Analytical Transmission Note: </strong>
          {sectorData.description} Higher interest rates typically exert downward pressure on equity discount rates, but resilient sectors with low leverage or strong export cash flows maintain balance sheet advantages.
        </div>
      </div>
    </div>
  );
};

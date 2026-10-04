/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { OHLCVBar, TechnicalAnalysisResult } from '../types/index.ts';
import { formatINR, formatIndianNumber } from '../utils/format.ts';
import { TradingViewChart } from './TradingViewChart.tsx';
import { Layers, TrendingUp, BarChart2, Shield, MonitorPlay, Activity } from 'lucide-react';

interface InteractiveChartProps {
  bars: OHLCVBar[];
  technical: TechnicalAnalysisResult;
  symbol: string;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  bars,
  technical,
  symbol,
}) => {
  // Chart View Mode: TradingView Terminal vs ARTHA Quantitative Engine
  const [chartEngine, setChartEngine] = useState<'tradingview' | 'artha'>('tradingview');

  const [range, setRange] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [overlays, setOverlays] = useState({
    sma20: true,
    ema50: true,
    ema200: false,
    bollinger: true,
    supportResistance: true,
  });
  const [subPane, setSubPane] = useState<'rsi' | 'macd' | 'volume'>('rsi');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Filter bars based on chosen range
  const filteredBars = useMemo(() => {
    const count = range === '1M' ? 22 : range === '3M' ? 66 : range === '6M' ? 120 : bars.length;
    return bars.slice(-count);
  }, [bars, range]);

  const n = filteredBars.length;
  const activeHover = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < n ? hoverIndex : n - 1;
  const currentBar = filteredBars[activeHover] || filteredBars[n - 1];

  // Price boundaries
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;
    for (const b of filteredBars) {
      if (b.low < min) min = b.low;
      if (b.high > max) max = b.high;
      if (b.volume > maxVol) maxVol = b.volume;
    }
    const pad = (max - min) * 0.05;
    return {
      minPrice: Math.max(0, min - pad),
      maxPrice: max + pad,
      maxVolume: maxVol,
    };
  }, [filteredBars]);

  const chartHeight = 320;
  const subPaneHeight = 90;

  const getY = (val: number) => {
    if (maxPrice === minPrice) return chartHeight / 2;
    return chartHeight - ((val - minPrice) / (maxPrice - minPrice)) * chartHeight;
  };

  const getSubY = (val: number, minVal: number, maxVal: number) => {
    if (maxVal === minVal) return subPaneHeight / 2;
    return subPaneHeight - ((val - minVal) / (maxVal - minVal)) * subPaneHeight;
  };

  return (
    <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-4 shadow-lg flex flex-col gap-4">
      {/* Engine Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1B2B48]">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#070F1F] p-1 rounded-lg border border-[#1B2B48] text-xs">
            <button
              onClick={() => setChartEngine('tradingview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
                chartEngine === 'tradingview'
                  ? 'bg-[#1B2B48] text-[#FF9933] shadow'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <MonitorPlay className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>TradingView Live Terminal</span>
            </button>

            <button
              onClick={() => setChartEngine('artha')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
                chartEngine === 'artha'
                  ? 'bg-[#1B2B48] text-[#38BDF8] shadow'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>ARTHA Quantitative Indicator Model</span>
            </button>
          </div>
        </div>

        {/* Quick Info Badge */}
        <div className="text-xs text-[#94A3B8] flex items-center gap-2">
          <span>Active Symbol: <strong className="text-white font-mono">{symbol}</strong></span>
          <span>·</span>
          <span>Exchange: <strong className="text-[#16A34A]">NSE India</strong></span>
        </div>
      </div>

      {/* MODE 1: TRADINGVIEW LIVE TERMINAL */}
      {chartEngine === 'tradingview' && (
        <TradingViewChart symbol={symbol} height={500} />
      )}

      {/* MODE 2: ARTHA QUANTITATIVE INDICATOR CHART */}
      {chartEngine === 'artha' && (
        <div className="flex flex-col gap-3">
          {/* Top Controls: Range & Subpanes */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#1B2B48]/50">
            {/* Active Bar Inspection */}
            <div className="flex items-center gap-3 text-xs font-mono">
              {currentBar && (
                <div className="flex flex-wrap items-center gap-2.5 text-[#94A3B8]">
                  <span>Date: <strong className="text-white">{currentBar.time}</strong></span>
                  <span>O: <strong className="text-white">{formatINR(currentBar.open)}</strong></span>
                  <span>H: <strong className="text-[#16A34A]">{formatINR(currentBar.high)}</strong></span>
                  <span>L: <strong className="text-[#E5484D]">{formatINR(currentBar.low)}</strong></span>
                  <span>C: <strong className="text-white">{formatINR(currentBar.close)}</strong></span>
                  <span>Vol: <strong className="text-white">{formatIndianNumber(currentBar.volume, 0)}</strong></span>
                </div>
              )}
            </div>

            {/* Range & Sub Pane Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#070F1F] p-0.5 rounded-lg border border-[#1B2B48] text-xs">
                {(['1M', '3M', '6M', '1Y'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      range === r ? 'bg-[#1B2B48] text-[#FF9933]' : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-[#070F1F] p-0.5 rounded-lg border border-[#1B2B48] text-xs">
                <button
                  onClick={() => setSubPane('rsi')}
                  className={`px-2 py-1 rounded font-medium ${subPane === 'rsi' ? 'bg-[#1B2B48] text-white' : 'text-[#64748B]'}`}
                >
                  RSI (14)
                </button>
                <button
                  onClick={() => setSubPane('macd')}
                  className={`px-2 py-1 rounded font-medium ${subPane === 'macd' ? 'bg-[#1B2B48] text-white' : 'text-[#64748B]'}`}
                >
                  MACD
                </button>
                <button
                  onClick={() => setSubPane('volume')}
                  className={`px-2 py-1 rounded font-medium ${subPane === 'volume' ? 'bg-[#1B2B48] text-white' : 'text-[#64748B]'}`}
                >
                  Volume
                </button>
              </div>
            </div>
          </div>

          {/* Overlay Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#94A3B8]">
            <span className="flex items-center gap-1 text-[#64748B]">
              <Layers className="w-3 h-3 text-[#FF9933]" /> Model Overlays:
            </span>

            <button
              onClick={() => setOverlays(o => ({ ...o, sma20: !o.sma20 }))}
              className={`px-2 py-0.5 rounded border transition-colors ${
                overlays.sma20 ? 'bg-[#FF9933]/10 border-[#FF9933] text-[#FF9933]' : 'border-[#1B2B48] text-[#64748B]'
              }`}
            >
              SMA 20 (₹{technical.series.sma20.slice(-1)[0]?.toFixed(1) || '-'})
            </button>

            <button
              onClick={() => setOverlays(o => ({ ...o, ema50: !o.ema50 }))}
              className={`px-2 py-0.5 rounded border transition-colors ${
                overlays.ema50 ? 'bg-[#38BDF8]/10 border-[#38BDF8] text-[#38BDF8]' : 'border-[#1B2B48] text-[#64748B]'
              }`}
            >
              EMA 50 (₹{technical.emas.ema50.toFixed(1)})
            </button>

            <button
              onClick={() => setOverlays(o => ({ ...o, ema200: !o.ema200 }))}
              className={`px-2 py-0.5 rounded border transition-colors ${
                overlays.ema200 ? 'bg-[#A855F7]/10 border-[#A855F7] text-[#A855F7]' : 'border-[#1B2B48] text-[#64748B]'
              }`}
            >
              EMA 200 (₹{technical.emas.ema200.toFixed(1)})
            </button>

            <button
              onClick={() => setOverlays(o => ({ ...o, bollinger: !o.bollinger }))}
              className={`px-2 py-0.5 rounded border transition-colors ${
                overlays.bollinger ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]' : 'border-[#1B2B48] text-[#64748B]'
              }`}
            >
              Bollinger Bands (20, 2σ)
            </button>

            <button
              onClick={() => setOverlays(o => ({ ...o, supportResistance: !o.supportResistance }))}
              className={`px-2 py-0.5 rounded border transition-colors ${
                overlays.supportResistance ? 'bg-[#F43F5E]/10 border-[#F43F5E] text-[#F43F5E]' : 'border-[#1B2B48] text-[#64748B]'
              }`}
            >
              Support/Resistance Pivots
            </button>
          </div>

          {/* SVG Candlestick Pane */}
          <div className="relative w-full bg-[#070F1F] rounded-lg border border-[#1B2B48] overflow-hidden">
            <svg
              className="w-full select-none"
              viewBox={`0 0 1000 ${chartHeight}`}
              preserveAspectRatio="none"
              style={{ height: `${chartHeight}px` }}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Grid lines */}
              {[0.2, 0.4, 0.6, 0.8].map(ratio => {
                const y = chartHeight * ratio;
                const priceLevel = maxPrice - ratio * (maxPrice - minPrice);
                return (
                  <g key={ratio}>
                    <line x1="0" y1={y} x2="1000" y2={y} stroke="#172A46" strokeDasharray="4 4" strokeWidth="1" />
                    <text x="990" y={y - 4} fill="#475569" fontSize="10" textAnchor="end" fontFamily="JetBrains Mono">
                      ₹{priceLevel.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* S/R Pivots */}
              {overlays.supportResistance && (
                <>
                  {technical.levels.pivotResistance.map((r, i) => {
                    const y = getY(r);
                    if (y < 0 || y > chartHeight) return null;
                    return (
                      <g key={`res-${i}`}>
                        <line x1="0" y1={y} x2="1000" y2={y} stroke="#E5484D" strokeWidth="1" strokeDasharray="3 3" />
                        <text x="10" y={y - 3} fill="#E5484D" fontSize="9" fontFamily="JetBrains Mono">
                          Resistance ₹{r.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}
                  {technical.levels.pivotSupport.map((s, i) => {
                    const y = getY(s);
                    if (y < 0 || y > chartHeight) return null;
                    return (
                      <g key={`sup-${i}`}>
                        <line x1="0" y1={y} x2="1000" y2={y} stroke="#16A34A" strokeWidth="1" strokeDasharray="3 3" />
                        <text x="10" y={y + 11} fill="#16A34A" fontSize="9" fontFamily="JetBrains Mono">
                          Support ₹{s.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}

              {/* Candlesticks */}
              {filteredBars.map((bar, i) => {
                const x = (i / (n - 1 || 1)) * 960 + 20;
                const isGreen = bar.close >= bar.open;
                const color = isGreen ? '#16A34A' : '#E5484D';

                const yHigh = getY(bar.high);
                const yLow = getY(bar.low);
                const yOpen = getY(bar.open);
                const yClose = getY(bar.close);

                const bodyTop = Math.min(yOpen, yClose);
                const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
                const cWidth = Math.max(3, (960 / n) * 0.7);

                return (
                  <g key={bar.time} onMouseEnter={() => setHoverIndex(i)} className="cursor-crosshair">
                    <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.5" />
                    <rect x={x - cWidth / 2} y={bodyTop} width={cWidth} height={bodyHeight} fill={color} rx="1" />
                  </g>
                );
              })}
            </svg>

            {/* Sub Pane: RSI / MACD / Volume */}
            <div className="border-t border-[#1B2B48] bg-[#070F1F]">
              <div className="px-3 py-1 flex items-center justify-between text-[10px] text-[#64748B] font-mono">
                <span>
                  {subPane === 'rsi' && `RSI (14, Wilder): ${technical.rsi14}`}
                  {subPane === 'macd' && `MACD: Line ${technical.macd.line} · Signal ${technical.macd.signal} · Hist ${technical.macd.histogram}`}
                  {subPane === 'volume' && `Volume (SMA 20): Current ${formatIndianNumber(currentBar.volume, 0)}`}
                </span>
                <span>
                  {subPane === 'rsi' && 'Oversold < 30 · Overbought > 70'}
                  {subPane === 'macd' && technical.macd.crossover !== 'none' && `Cross: ${technical.macd.crossover}`}
                  {subPane === 'volume' && technical.volumeAnalysis.isSpike && 'Volume Spike Detected'}
                </span>
              </div>

              <svg
                className="w-full"
                viewBox={`0 0 1000 ${subPaneHeight}`}
                preserveAspectRatio="none"
                style={{ height: `${subPaneHeight}px` }}
              >
                {subPane === 'rsi' && (
                  <>
                    <line x1="0" y1={getSubY(70, 0, 100)} x2="1000" y2={getSubY(70, 0, 100)} stroke="#E5484D" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="0" y1={getSubY(30, 0, 100)} x2="1000" y2={getSubY(30, 0, 100)} stroke="#16A34A" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="0" y1={getSubY(50, 0, 100)} x2="1000" y2={getSubY(50, 0, 100)} stroke="#172A46" strokeDasharray="2 2" strokeWidth="0.8" />
                    {(() => {
                      const points = technical.series.rsi
                        .slice(-n)
                        .map((val, idx) => {
                          const x = (idx / (n - 1 || 1)) * 960 + 20;
                          const y = getSubY(isNaN(val) ? 50 : val, 0, 100);
                          return `${x},${y}`;
                        })
                        .join(' ');
                      return <polyline points={points} fill="none" stroke="#FF9933" strokeWidth="2" />;
                    })()}
                  </>
                )}

                {subPane === 'macd' && (
                  <>
                    <line x1="0" y1={subPaneHeight / 2} x2="1000" y2={subPaneHeight / 2} stroke="#172A46" strokeWidth="1" />
                    {technical.series.macdHist.slice(-n).map((h, i) => {
                      const x = (i / (n - 1 || 1)) * 960 + 20;
                      const isPos = h >= 0;
                      const yZero = subPaneHeight / 2;
                      const scaledH = Math.min(subPaneHeight / 2 - 2, Math.abs(h) * 1.5);
                      const y = isPos ? yZero - scaledH : yZero;
                      return (
                        <rect
                          key={i}
                          x={x - 2}
                          y={y}
                          width={4}
                          height={Math.max(1, scaledH)}
                          fill={isPos ? '#16A34A' : '#E5484D'}
                          opacity="0.8"
                        />
                      );
                    })}
                  </>
                )}

                {subPane === 'volume' && (
                  <>
                    {filteredBars.map((b, i) => {
                      const x = (i / (n - 1 || 1)) * 960 + 20;
                      const barH = (b.volume / maxVolume) * (subPaneHeight - 10);
                      const isGreen = b.close >= b.open;
                      return (
                        <rect
                          key={i}
                          x={x - 2}
                          y={subPaneHeight - barH}
                          width={Math.max(2, (960 / n) * 0.6)}
                          height={barH}
                          fill={isGreen ? '#16A34A' : '#E5484D'}
                          opacity="0.6"
                        />
                      );
                    })}
                  </>
                )}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Algorithmic Signals Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
        {technical.signals.slice(0, 3).map((sig, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 p-2.5 rounded-lg bg-[#070F1F] border border-[#1B2B48] text-xs"
          >
            <div
              className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                sig.state === 'bullish'
                  ? 'bg-[#16A34A]'
                  : sig.state === 'bearish'
                  ? 'bg-[#E5484D]'
                  : 'bg-[#94A3B8]'
              }`}
            />
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-white">{sig.name}</span>
                <span className="text-[10px] text-[#64748B] font-mono-numbers">
                  Conf: {sig.confidence}%
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                {sig.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Loader2,
  ExternalLink,
  RefreshCw,
  Layers,
  Check,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'dark' | 'light';
  height?: number;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  theme = 'dark',
  height = 540,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interval, setInterval] = useState<'D' | 'W' | 'M' | '60' | '15'>('D');

  // Active Technical Indicator Studies in TradingView
  const [activeStudies, setActiveStudies] = useState<{ [id: string]: boolean }>({
    'STD;RSI': true,
    'STD;MACD': true,
    'STD;EMA': true,
    'STD;Bollinger_Bands': true,
    'STD;SMA': false,
    'STD;Volume': true,
  });

  // Map internal symbol to TradingView Indian market format
  const getTradingViewSymbol = (sym: string): string => {
    const clean = sym.toUpperCase().trim();
    if (clean === '^NSEI') return 'NSE:NIFTY';
    if (clean === '^NSEBANK') return 'NSE:BANKNIFTY';
    if (clean === '^BSESN') return 'BSE:SENSEX';

    const base = clean.replace(/\.(NS|BO)$/, '');
    const isBSE = clean.endsWith('.BO');
    return `${isBSE ? 'BSE' : 'NSE'}:${base}`;
  };

  const tvSymbol = getTradingViewSymbol(symbol);

  // Available Studies Configuration
  const availableIndicators = [
    { id: 'STD;RSI', name: 'RSI (14)', label: 'Relative Strength Index' },
    { id: 'STD;MACD', name: 'MACD (12,26,9)', label: 'MACD + Signal + Hist' },
    { id: 'STD;EMA', name: 'EMA', label: 'Exponential Moving Average' },
    { id: 'STD;Bollinger_Bands', name: 'Bollinger Bands', label: '20-period 2σ Bands' },
    { id: 'STD;Volume', name: 'Volume', label: 'Volume Bars' },
    { id: 'STD;SMA', name: 'SMA', label: 'Simple Moving Average' },
  ];

  const toggleStudy = (studyId: string) => {
    setActiveStudies((prev) => ({
      ...prev,
      [studyId]: !prev[studyId],
    }));
  };

  const applyPreset = (preset: 'all' | 'trend' | 'momentum' | 'clean') => {
    if (preset === 'all') {
      setActiveStudies({
        'STD;RSI': true,
        'STD;MACD': true,
        'STD;EMA': true,
        'STD;Bollinger_Bands': true,
        'STD;SMA': true,
        'STD;Volume': true,
      });
    } else if (preset === 'trend') {
      setActiveStudies({
        'STD;RSI': false,
        'STD;MACD': false,
        'STD;EMA': true,
        'STD;Bollinger_Bands': true,
        'STD;SMA': true,
        'STD;Volume': true,
      });
    } else if (preset === 'momentum') {
      setActiveStudies({
        'STD;RSI': true,
        'STD;MACD': true,
        'STD;EMA': false,
        'STD;Bollinger_Bands': false,
        'STD;SMA': false,
        'STD;Volume': true,
      });
    } else {
      // Clean
      setActiveStudies({
        'STD;RSI': false,
        'STD;MACD': false,
        'STD;EMA': false,
        'STD;Bollinger_Bands': false,
        'STD;SMA': false,
        'STD;Volume': false,
      });
    }
  };

  // Compile selected studies for TradingView widget
  const selectedStudiesList = Object.entries(activeStudies)
    .filter(([_, isEnabled]) => isEnabled)
    .map(([studyId]) => studyId);

  // Mount official TradingView Advanced Real-Time Chart widget
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    widgetContainer.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;

    // Both STD and tv-basicstudies fallback format for maximum compatibility
    const studiesToInject = selectedStudiesList.map((s) => {
      if (s === 'STD;RSI') return 'STD;RSI';
      if (s === 'STD;MACD') return 'STD;MACD';
      if (s === 'STD;EMA') return 'STD;EMA';
      if (s === 'STD;Bollinger_Bands') return 'STD;Bollinger_Bands';
      if (s === 'STD;SMA') return 'STD;SMA';
      if (s === 'STD;Volume') return 'STD;Volume';
      return s;
    });

    const widgetConfig = {
      autosize: true,
      symbol: tvSymbol,
      interval: interval,
      timezone: 'Asia/Kolkata',
      theme: 'dark',
      style: '1', // Candlesticks
      locale: 'in',
      enable_publishing: false,
      allow_symbol_change: true,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      studies: studiesToInject,
      support_host: 'https://www.tradingview.com',
      calendar: false,
      withdateranges: true,
      details: true,
      hotlist: false,
      show_popup_button: true,
      popup_width: '1000',
      popup_height: '650',
    };

    script.innerHTML = JSON.stringify(widgetConfig);
    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tvSymbol, interval, JSON.stringify(selectedStudiesList)]);

  return (
    <div className="relative w-full rounded-xl bg-[#070F1F] border border-[#1B2B48] overflow-hidden shadow-xl flex flex-col">
      {/* Top Header Bar */}
      <div className="px-3.5 py-2.5 bg-[#0B1F3A] border-b border-[#1B2B48] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Ticker & Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="font-bold text-white tracking-wide">
            TradingView Live Indian Market Chart
          </span>
          <span className="text-[#64748B]">·</span>
          <span className="font-mono text-[#FF9933] font-bold text-xs">{tvSymbol}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] font-semibold">
            NSE / BSE Live
          </span>
        </div>

        {/* Interval Selector Buttons */}
        <div className="flex items-center gap-1 bg-[#070F1F] p-0.5 rounded-lg border border-[#1B2B48] text-xs">
          {[
            { id: '15', label: '15m' },
            { id: '60', label: '1h' },
            { id: 'D', label: '1D' },
            { id: 'W', label: '1W' },
            { id: 'M', label: '1M' },
          ].map((int) => (
            <button
              key={int.id}
              onClick={() => setInterval(int.id as any)}
              className={`px-2.5 py-1 rounded font-mono text-[11px] font-medium transition-colors ${
                interval === int.id
                  ? 'bg-[#1B2B48] text-[#FF9933] font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {int.label}
            </button>
          ))}
        </div>

        {/* External Link */}
        <div className="flex items-center gap-2 text-[#94A3B8] text-[11px]">
          <a
            href={`https://www.tradingview.com/symbols/${tvSymbol.replace(':', '-')}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#FF9933] hover:underline"
          >
            <span>Full TV Page</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Indicator Selection Strip */}
      <div className="px-3.5 py-2 bg-[#081528] border-b border-[#1B2B48] flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 text-[11px] text-[#FF9933] font-bold uppercase tracking-wider mr-1">
            <Layers className="w-3.5 h-3.5" /> Indicators Applied:
          </span>

          {availableIndicators.map((ind) => {
            const isSelected = !!activeStudies[ind.id];
            return (
              <button
                key={ind.id}
                onClick={() => toggleStudy(ind.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-[#FF9933]/20 border border-[#FF9933] text-[#FF9933] shadow-sm font-semibold'
                    : 'bg-[#070F1F] border border-[#1B2B48] text-[#94A3B8] hover:text-white hover:border-[#2D436B]'
                }`}
                title={ind.label}
              >
                {isSelected && <Check className="w-3 h-3 text-[#FF9933]" />}
                <span>{ind.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[#64748B]">Presets:</span>
          <button
            onClick={() => applyPreset('all')}
            className="px-2 py-0.5 rounded bg-[#070F1F] border border-[#1B2B48] text-[#38BDF8] hover:bg-[#1B2B48] font-medium"
          >
            Full Suite (RSI + MACD + EMA + BB)
          </button>
          <button
            onClick={() => applyPreset('momentum')}
            className="px-2 py-0.5 rounded bg-[#070F1F] border border-[#1B2B48] text-[#16A34A] hover:bg-[#1B2B48] font-medium"
          >
            RSI + MACD
          </button>
          <button
            onClick={() => applyPreset('trend')}
            className="px-2 py-0.5 rounded bg-[#070F1F] border border-[#1B2B48] text-[#A855F7] hover:bg-[#1B2B48] font-medium"
          >
            EMA + Bands
          </button>
          <button
            onClick={() => applyPreset('clean')}
            className="px-2 py-0.5 rounded bg-[#070F1F] border border-[#1B2B48] text-[#94A3B8] hover:bg-[#1B2B48]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* TradingView Advanced Real-Time Chart Container */}
      <div
        ref={containerRef}
        className="w-full relative bg-[#070F1F]"
        style={{ height: `${height}px`, minHeight: `${height}px` }}
      />

      {/* Helpful Guidance Footer */}
      <div className="px-3.5 py-2 bg-[#050B17] border-t border-[#1B2B48] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#FF9933]" />
          <span>
            {selectedStudiesList.length > 0 ? (
              <>
                Active indicators ({selectedStudiesList.length}):{' '}
                <strong className="text-white">
                  {selectedStudiesList
                    .map((s) => s.replace('STD;', ''))
                    .join(', ')}
                </strong>
                . You can also click the <strong className="text-[#38BDF8]">&quot;Indicators (fx)&quot;</strong> button inside the top chart toolbar to search and add 100+ community indicators (Supertrend, VWAP, Pivot Points).
              </>
            ) : (
              <span>Click any indicator button above to toggle RSI, MACD, EMA, or Bollinger Bands.</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArthaLogo } from './ArthaLogo.tsx';
import { MarketStatusBadge } from './MarketStatusBadge.tsx';
import {
  Search,
  Activity,
  Scale,
  Briefcase,
  Landmark,
  Calculator,
  Info,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { INDIAN_STOCKS_UNIVERSE } from '../data/sampleData.ts';
import { providerRouter } from '../services/providerRouter.ts';
import { formatINR, formatPercent } from '../utils/format.ts';

interface NavbarProps {
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  activeView: string;
  onSelectView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSymbol,
  onSelectSymbol,
  activeView,
  onSelectView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchResults = providerRouter.searchSymbols(searchQuery);

  const quickCategories = [
    { label: 'All NIFTY', sym: 'RELIANCE.NS' },
    { label: 'TCS', sym: 'TCS.NS' },
    { label: 'Infosys', sym: 'INFY.NS' },
    { label: 'HDFC Bank', sym: 'HDFCBANK.NS' },
    { label: 'ICICI Bank', sym: 'ICICIBANK.NS' },
    { label: 'Tata Motors', sym: 'TATAMOTORS.NS' },
    { label: 'Zomato', sym: 'ZOMATO.NS' },
    { label: 'BEL (Defence)', sym: 'BEL.NS' },
    { label: 'HAL (Defence)', sym: 'HAL.NS' },
    { label: 'Paytm', sym: 'PAYTM.NS' },
    { label: 'Tata Steel', sym: 'TATASTEEL.NS' },
  ];

  const handleSelect = (sym: string) => {
    onSelectSymbol(sym);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const cleanSym = searchQuery.toUpperCase().trim();
    handleSelect(cleanSym);
  };

  const navLinks = [
    { id: 'research', label: 'Stock Research', icon: Activity },
    { id: 'compare', label: 'Compare Radar', icon: Scale },
    { id: 'portfolio', label: 'Portfolio & MPT', icon: Briefcase },
    { id: 'macro', label: 'Macro Transmission', icon: Landmark },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'docs', label: 'Architecture & Docs', icon: Info },
  ];

  const nifty = INDIAN_STOCKS_UNIVERSE['^NSEI'];
  const bankNifty = INDIAN_STOCKS_UNIVERSE['^NSEBANK'];
  const sensex = INDIAN_STOCKS_UNIVERSE['^BSESN'];

  return (
    <header className="sticky top-0 z-30 bg-[#070F1F]/95 backdrop-blur-md border-b border-[#1B2B48]">
      {/* Top Banner: Benchmark Tickers & Market Session */}
      <div className="bg-[#050B17] border-b border-[#1B2B48]/50 px-4 py-1.5 flex items-center justify-between text-[11px]">
        {/* Benchmarks Strip */}
        <div className="flex items-center gap-6 overflow-x-auto">
          {nifty && (
            <div
              onClick={() => handleSelect('^NSEI')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-[#94A3B8] font-medium">NIFTY 50:</span>
              <span className="font-bold text-white font-mono-numbers">
                {nifty.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className={`font-semibold font-mono-numbers ${nifty.changePercent >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}`}>
                {formatPercent(nifty.changePercent)}
              </span>
            </div>
          )}

          {bankNifty && (
            <div
              onClick={() => handleSelect('^NSEBANK')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-[#94A3B8] font-medium">BANK NIFTY:</span>
              <span className="font-bold text-white font-mono-numbers">
                {bankNifty.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className={`font-semibold font-mono-numbers ${bankNifty.changePercent >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}`}>
                {formatPercent(bankNifty.changePercent)}
              </span>
            </div>
          )}

          {sensex && (
            <div
              onClick={() => handleSelect('^BSESN')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-[#94A3B8] font-medium">SENSEX:</span>
              <span className="font-bold text-white font-mono-numbers">
                {sensex.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className={`font-semibold font-mono-numbers ${sensex.changePercent >= 0 ? 'text-[#16A34A]' : 'text-[#E5484D]'}`}>
                {formatPercent(sensex.changePercent)}
              </span>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-2 text-[#64748B]">
            <span>India 10Y Sovereign: <strong className="text-[#CBD5E1]">7.02%</strong></span>
            <span>·</span>
            <span>USD/INR: <strong className="text-[#CBD5E1]">₹83.82</strong></span>
          </div>
        </div>

        {/* Live IST Market Session Status */}
        <MarketStatusBadge />
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div onClick={() => onSelectView('research')} className="cursor-pointer shrink-0">
          <ArthaLogo size="md" showTagline={true} />
        </div>

        {/* Universal Search Bar with Symbol Dropdown */}
        <div className="relative w-80 lg:w-96">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search ANY Indian Stock (e.g. ZOMATO, BEL, RELIANCE, TCS)..."
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B1F3A] border border-[#1B2B48] rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FF9933] font-medium transition-colors"
            />
            {searchQuery && (
              <button
                type="submit"
                className="absolute right-2 px-1.5 py-0.5 rounded bg-[#FF9933] text-slate-950 text-[10px] font-bold"
              >
                Go
              </button>
            )}
          </form>

          {isDropdownOpen && (
            <div
              className="absolute left-0 right-0 top-full mt-1.5 bg-[#0B1F3A] border border-[#1B2B48] rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-50 divide-y divide-[#1B2B48]"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              {/* Quick Prompt if typing something new */}
              {searchQuery && (
                <div
                  onClick={() => handleSelect(searchQuery)}
                  className="p-2.5 bg-[#070F1F] hover:bg-[#1B2B48] cursor-pointer text-xs text-[#FF9933] flex items-center justify-between"
                >
                  <span className="font-semibold">
                    Analyze &quot;{searchQuery.toUpperCase()}&quot; across Indian Markets
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              )}

              {searchResults.map(sym => (
                <div
                  key={sym.symbol}
                  onClick={() => handleSelect(sym.symbol)}
                  className="px-3 py-2 flex items-center justify-between hover:bg-[#1B2B48] cursor-pointer text-xs transition-colors"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{sym.symbol}</span>
                      <span className="text-[10px] px-1 py-0.2 bg-[#070F1F] text-[#FF9933] rounded">
                        {sym.exchange}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">{sym.name} · {sym.sector}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#64748B]" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectView(link.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1B2B48] text-[#FF9933] shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#0B1F3A]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Indian Stock Market Categories Strip */}
      <div className="bg-[#070F1F] border-t border-[#1B2B48]/50 px-4 py-1.5 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-[#64748B] shrink-0 font-medium flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-[#FF9933]" /> Popular NSE/BSE:
        </span>
        {quickCategories.map(cat => (
          <button
            key={cat.sym}
            onClick={() => handleSelect(cat.sym)}
            className={`px-2.5 py-0.5 rounded-full border text-[11px] whitespace-nowrap transition-colors ${
              currentSymbol === cat.sym
                ? 'bg-[#FF9933]/10 border-[#FF9933] text-[#FF9933] font-semibold'
                : 'border-[#1B2B48] text-[#94A3B8] hover:text-white hover:border-[#2D436B]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center justify-around bg-[#070F1F] border-t border-[#1B2B48] py-2 px-2 text-[10px]">
        {navLinks.map(link => {
          const Icon = link.icon;
          const isActive = activeView === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onSelectView(link.id)}
              className={`flex flex-col items-center gap-1 ${isActive ? 'text-[#FF9933]' : 'text-[#64748B]'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

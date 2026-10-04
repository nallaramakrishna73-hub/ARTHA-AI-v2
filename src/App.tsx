/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { ScoreGauges } from './components/ScoreGauges.tsx';
import { InteractiveChart } from './components/InteractiveChart.tsx';
import { AgentTimeline } from './components/AgentTimeline.tsx';
import { ReportView } from './components/ReportView.tsx';
import { CompareView } from './components/CompareView.tsx';
import { PortfolioOptimizerView } from './components/PortfolioOptimizerView.tsx';
import { MacroDashboardView } from './components/MacroDashboardView.tsx';
import { CalculatorsView } from './components/CalculatorsView.tsx';
import { AlertsView } from './components/AlertsView.tsx';
import { MonitoringView } from './components/MonitoringView.tsx';
import { DocsView } from './components/DocsView.tsx';
import { FloatingChat } from './components/FloatingChat.tsx';
import { DisclaimerBanner } from './components/DisclaimerBanner.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

import {
  QuoteData,
  OHLCVBar,
  TechnicalAnalysisResult,
  FundamentalData,
  SentimentAnalysisResult,
  MacroAnalysisResult,
  RiskAnalysisResult,
  ResearchReport,
  AgentStepTrace,
  PortfolioHolding,
  PortfolioAnalytics,
} from './types/index.ts';

import { providerRouter } from './services/providerRouter.ts';
import { analyzeTechnical } from './analysis/technical.ts';
import { analyzeRisk } from './analysis/risk.ts';
import { analyzeSentiment } from './analysis/sentiment.ts';
import { analyzeMacro } from './analysis/macro.ts';
import { researchAgent } from './agent/researchAgent.ts';
import { getSampleHoldings, computePortfolioAnalytics } from './analysis/portfolio.ts';
import { formatINR, formatLakhCrore, formatPercent, getPercentColorClass } from './utils/format.ts';
import { Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const [currentSymbol, setCurrentSymbol] = useState<string>('RELIANCE.NS');
  const [compareSymbol, setCompareSymbol] = useState<string>('TCS.NS');
  const [activeView, setActiveView] = useState<string>('research');

  // Core Data State
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [bars, setBars] = useState<OHLCVBar[]>([]);
  const [technical, setTechnical] = useState<TechnicalAnalysisResult | null>(null);
  const [fundamentals, setFundamentals] = useState<FundamentalData | null>(null);
  const [sentiment, setSentiment] = useState<SentimentAnalysisResult | null>(null);
  const [macro, setMacro] = useState<MacroAnalysisResult | null>(null);
  const [risk, setRisk] = useState<RiskAnalysisResult | null>(null);
  const [report, setReport] = useState<ResearchReport | null>(null);

  const [compareReport1, setCompareReport1] = useState<ResearchReport | null>(null);
  const [compareReport2, setCompareReport2] = useState<ResearchReport | null>(null);
  const [agentSteps, setAgentSteps] = useState<AgentStepTrace[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Portfolio State
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(() => getSampleHoldings());
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<PortfolioAnalytics>(() =>
    computePortfolioAnalytics(getSampleHoldings())
  );

  // Load symbol data asynchronously whenever currentSymbol changes
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const q = await providerRouter.getQuote(currentSymbol);
        const b = await providerRouter.getHistory(currentSymbol);
        const niftyB = await providerRouter.getHistory('^NSEI');
        const fund = await providerRouter.getFundamentals(currentSymbol);
        const news = await providerRouter.getNews(currentSymbol);
        const sent = await analyzeSentiment(news, currentSymbol);
        const mac = analyzeMacro(q.sector);
        const tech = analyzeTechnical(b, currentSymbol);
        const rsk = analyzeRisk(b, niftyB, currentSymbol);

        if (isMounted) {
          setQuote(q);
          setBars(b);
          setTechnical(tech);
          setFundamentals(fund);
          setSentiment(sent);
          setMacro(mac);
          setRisk(rsk);

          const rpt = await researchAgent.runResearchWorkflow(currentSymbol);
          setReport(rpt);
        }
      } catch (err) {
        console.error('Error updating symbol data:', err);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [currentSymbol]);

  // Load comparison reports when compare view is viewed
  useEffect(() => {
    if (activeView === 'compare') {
      async function loadCompare() {
        try {
          const r1 = await researchAgent.runResearchWorkflow(currentSymbol);
          const r2 = await researchAgent.runResearchWorkflow(compareSymbol);
          setCompareReport1(r1);
          setCompareReport2(r2);
        } catch (err) {
          console.error('Error setting compare reports:', err);
        }
      }
      loadCompare();
    }
  }, [activeView, currentSymbol, compareSymbol]);

  const triggerAgentRun = async (symbolToRun: string) => {
    setIsAnalyzing(true);
    setAgentSteps([]);

    try {
      const generatedReport = await researchAgent.runResearchWorkflow(
        symbolToRun,
        (step) => {
          setAgentSteps((prev) => {
            const index = prev.findIndex((s) => s.node === step.node);
            if (index >= 0) {
              const next = [...prev];
              next[index] = step;
              return next;
            }
            return [...prev, step];
          });
        }
      );
      setReport(generatedReport);
    } catch (err) {
      console.error('Agent workflow error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const availableSymbols = [
    'RELIANCE.NS',
    'TCS.NS',
    'INFY.NS',
    'HDFCBANK.NS',
    'ICICIBANK.NS',
    'BHARTIARTL.NS',
    'SBIN.NS',
    'ITC.NS',
    'LT.NS',
    'TATAMOTORS.NS',
    'BAJFINANCE.NS',
    'ZOMATO.NS',
    'BEL.NS',
    'HAL.NS',
    'TATASTEEL.NS',
  ];

  return (
    <ErrorBoundary fallbackTitle="ARTHA AI Encountered a Problem">
      <div className="min-h-screen flex flex-col bg-[#070F1F] text-[#E6EDF7]">
        {/* Top Navbar */}
        <Navbar
          currentSymbol={currentSymbol}
          onSelectSymbol={(sym) => setCurrentSymbol(sym)}
          activeView={activeView}
          onSelectView={(v) => setActiveView(v)}
        />

        {/* Main Body Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
          {/* STOCK RESEARCH VIEW */}
          {activeView === 'research' && (
            <>
              {/* Top Quote Header Card */}
              {quote ? (
                <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-5 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-white tracking-wide">
                          {quote.name}
                        </h1>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#070F1F] border border-[#1B2B48] font-mono text-[#FF9933]">
                          {quote.symbol}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] font-semibold">
                          {quote.exchange}
                        </span>
                        {quote.isDemo && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                            Demo Data
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#94A3B8] mt-1">
                        Sector: <span className="text-white font-medium">{quote.sector}</span> · Data Source: <span className="text-emerald-400 font-semibold">{quote.source}</span> · As of: <span className="font-mono-numbers">{quote.asOf}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Metrics Cluster */}
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <div className="text-2xl font-bold font-mono-numbers text-white">
                        {formatINR(quote.price)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-bold font-mono-numbers ${getPercentColorClass(quote.changePercent)}`}>
                          {formatPercent(quote.changePercent)} ({formatINR(quote.change)})
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:grid grid-cols-2 gap-x-4 gap-y-1 text-xs border-l border-[#1B2B48] pl-6 text-[#94A3B8]">
                      <div>Day H/L: <strong className="text-white font-mono-numbers">{formatINR(quote.dayHigh)} / {formatINR(quote.dayLow)}</strong></div>
                      <div>52W H/L: <strong className="text-white font-mono-numbers">{formatINR(quote.fiftyTwoWeekHigh)} / {formatINR(quote.fiftyTwoWeekLow)}</strong></div>
                      <div>Market Cap: <strong className="text-white font-mono-numbers">{formatLakhCrore(quote.marketCap)}</strong></div>
                      <div>P/E: <strong className="text-white font-mono-numbers">{quote.peRatio ?? 'N/A'}x</strong></div>
                    </div>

                    <button
                      onClick={() => triggerAgentRun(currentSymbol)}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF9933] hover:bg-[#FF9933]/90 text-slate-950 font-semibold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0"
                    >
                      <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      <span>{isAnalyzing ? 'Running Agent Pipeline...' : 'Run Agent Analysis'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-6 flex items-center justify-center gap-3 text-xs text-[#94A3B8]">
                  <Loader2 className="w-5 h-5 animate-spin text-[#FF9933]" />
                  <span>Loading Indian market quote for {currentSymbol}...</span>
                </div>
              )}

              {/* Five-Part Analytical Score Gauges */}
              {report ? (
                <ScoreGauges scores={report.scores} />
              ) : (
                <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-6 flex items-center justify-center gap-3 text-xs text-[#94A3B8]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF9933]" />
                  <span>Synthesizing multi-factor analytical scores...</span>
                </div>
              )}

              {/* Interactive Candlestick & Volume Chart */}
              {technical && (
                <InteractiveChart
                  bars={bars}
                  technical={technical}
                  symbol={currentSymbol}
                />
              )}

              {/* LangGraph Streaming Agent Timeline */}
              <AgentTimeline steps={agentSteps} isStreaming={isAnalyzing} />

              {/* Complete 13-Section Evidence-Based Research Dossier */}
              {report && <ReportView report={report} />}
            </>
          )}

          {/* DUAL-STOCK COMPARE VIEW */}
          {activeView === 'compare' && (
            compareReport1 && compareReport2 ? (
              <CompareView
                report1={compareReport1}
                report2={compareReport2}
                onSelectStock1={(sym) => setCurrentSymbol(sym)}
                onSelectStock2={(sym) => setCompareSymbol(sym)}
                availableSymbols={availableSymbols}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-[#0B1F3A] rounded-xl border border-[#1B2B48] text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF9933] mb-3" />
                <span className="text-sm font-semibold text-white">
                  Benchmarking {currentSymbol} vs {compareSymbol}...
                </span>
              </div>
            )
          )}

          {/* PORTFOLIO & MPT OPTIMIZER VIEW */}
          {activeView === 'portfolio' && (
            <PortfolioOptimizerView
              holdings={holdings}
              analytics={portfolioAnalytics}
            />
          )}

          {/* MACRO RADAR VIEW */}
          {activeView === 'macro' && macro && (
            <MacroDashboardView
              indicators={providerRouter.getMacroIndicators()}
              analysis={macro}
            />
          )}

          {/* ALERTS VIEW */}
          {activeView === 'alerts' && <AlertsView />}

          {/* CALCULATORS VIEW */}
          {activeView === 'calculators' && <CalculatorsView />}

          {/* MONITORING VIEW */}
          {activeView === 'monitoring' && <MonitoringView />}

          {/* DOCS & ARCHITECTURE VIEW */}
          {activeView === 'docs' && <DocsView />}
        </main>

        {/* Floating Grounded AI Chat Assistant */}
        <FloatingChat currentSymbol={currentSymbol} />

        {/* Persistent SEBI Disclaimer Footer */}
        <DisclaimerBanner />
      </div>
    </ErrorBoundary>
  );
}

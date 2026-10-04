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
  const [quote, setQuote] = useState<QuoteData>(() => providerRouter.getQuote('RELIANCE.NS'));
  const [bars, setBars] = useState<OHLCVBar[]>(() => providerRouter.getHistory('RELIANCE.NS'));
  const [technical, setTechnical] = useState<TechnicalAnalysisResult>(() =>
    analyzeTechnical(providerRouter.getHistory('RELIANCE.NS'), 'RELIANCE.NS')
  );
  const [fundamentals, setFundamentals] = useState<FundamentalData>(() =>
    providerRouter.getFundamentals('RELIANCE.NS')
  );
  const [sentiment, setSentiment] = useState<SentimentAnalysisResult>(() =>
    analyzeSentiment(providerRouter.getNews('RELIANCE.NS'), 'RELIANCE.NS')
  );
  const [macro, setMacro] = useState<MacroAnalysisResult>(() =>
    analyzeMacro(providerRouter.getQuote('RELIANCE.NS').sector)
  );
  const [risk, setRisk] = useState<RiskAnalysisResult>(() =>
    analyzeRisk(
      providerRouter.getHistory('RELIANCE.NS'),
      providerRouter.getHistory('^NSEI'),
      'RELIANCE.NS'
    )
  );

  // Full 13-Section Report & Agent Pipeline State
  const [report, setReport] = useState<ResearchReport>(() =>
    researchAgent.generateReportSynchronous('RELIANCE.NS')
  );
  const [compareReport1, setCompareReport1] = useState<ResearchReport>(() =>
    researchAgent.generateReportSynchronous('RELIANCE.NS')
  );
  const [compareReport2, setCompareReport2] = useState<ResearchReport>(() =>
    researchAgent.generateReportSynchronous('TCS.NS')
  );
  const [agentSteps, setAgentSteps] = useState<AgentStepTrace[]>([
    { id: 'step-1', node: 'ResearchPlanner', title: 'Execution Plan & Intent Decomposition', status: 'completed', summary: 'Identified intent: deep equity research for RELIANCE.NS. Formulated dependency graph.', latencyMs: 120 },
    { id: 'step-2', node: 'MarketDataNode', title: 'Ingesting Market & Tick History', status: 'completed', summary: 'Retrieved 180-day daily OHLCV series and live trading quotes.', latencyMs: 90, evidenceItemsCount: 180 },
    { id: 'step-3', node: 'FundamentalNode', title: 'Extracting Financial Health & Ratios', status: 'completed', summary: 'Audited P/E, P/B, EV/EBITDA, ROE, debt leverage, and YoY growth.', latencyMs: 110, evidenceItemsCount: 16 },
    { id: 'step-4', node: 'NewsSentimentNode', title: 'Deduplicating News & FinBERT Inference', status: 'completed', summary: 'Parsed recent filings; calculated exponential recency decay and momentum.', latencyMs: 140, evidenceItemsCount: 4 },
    { id: 'step-5', node: 'MacroNode', title: 'Macro Transmission & Sector Sensitivity', status: 'completed', summary: 'Mapped RBI repo rate (6.50%), CPI (5.12%), and GDP to sector profile.', latencyMs: 95, evidenceItemsCount: 6 },
    { id: 'step-6', node: 'TechnicalNode', title: 'Computing Quantitative & Momentum Indicators', status: 'completed', summary: 'Calculated Wilder RSI(14), MACD, Bollinger Bands, and S/R pivots.', latencyMs: 100, evidenceItemsCount: 12 },
    { id: 'step-7', node: 'RiskNode', title: 'Parametric & Historical Risk Metrics', status: 'completed', summary: 'Derived annualized volatility, Beta vs NIFTY, 1D 95% VaR, and CVaR.', latencyMs: 110, evidenceItemsCount: 8 },
    { id: 'step-8', node: 'ScoringNode', title: 'Five-Pillar Composite Analytical Scoring', status: 'completed', summary: 'Synthesized Technical, Fundamental, Sentiment, Risk, and Macro sub-scores.', latencyMs: 90, evidenceItemsCount: 5 },
    { id: 'step-9', node: 'ResearchSynthesizer', title: 'Evidence-Grounded Dossier Formulation', status: 'completed', summary: 'Synthesized 13 research sections using strict numeric grounding.', latencyMs: 130 },
    { id: 'step-10', node: 'NumberValidator', title: 'Strict Numeric Grounding & Evidence Check', status: 'completed', summary: 'Validated numerical citations against tool evidence keys. 100% verified.', latencyMs: 85 },
    { id: 'step-11', node: 'ComplianceChecker', title: 'Regulatory SEBI Non-Advice Validation', status: 'completed', summary: '0 buy/sell directives found; statutory disclaimer appended.', latencyMs: 75 },
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Portfolio State
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(() => getSampleHoldings());
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<PortfolioAnalytics>(() =>
    computePortfolioAnalytics(getSampleHoldings())
  );

  // Load symbol data whenever currentSymbol changes
  useEffect(() => {
    try {
      const q = providerRouter.getQuote(currentSymbol);
      const b = providerRouter.getHistory(currentSymbol);
      const niftyB = providerRouter.getHistory('^NSEI');

      setQuote(q);
      setBars(b);
      setTechnical(analyzeTechnical(b, currentSymbol));
      setFundamentals(providerRouter.getFundamentals(currentSymbol));
      setSentiment(analyzeSentiment(providerRouter.getNews(currentSymbol), currentSymbol));
      setMacro(analyzeMacro(q.sector));
      setRisk(analyzeRisk(b, niftyB, currentSymbol));

      // Synchronously update report immediately so no null flash
      setReport(researchAgent.generateReportSynchronous(currentSymbol));
    } catch (err) {
      console.error('Error updating symbol data:', err);
    }
  }, [currentSymbol]);

  // Load comparison reports when compare view is viewed or symbols change
  useEffect(() => {
    if (activeView === 'compare') {
      try {
        setCompareReport1(researchAgent.generateReportSynchronous(currentSymbol));
        setCompareReport2(researchAgent.generateReportSynchronous(compareSymbol));
      } catch (err) {
        console.error('Error setting compare reports:', err);
      }
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
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-1">
                      Sector: <span className="text-white font-medium">{quote.sector}</span> · Data as of: <span className="font-mono-numbers">{quote.asOf}</span>
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

                  {/* Run Agent Workflow Button */}
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

              {/* Five-Part Analytical Score Gauges */}
              {report ? (
                <ScoreGauges scores={report.scores} />
              ) : (
                <div className="bg-[#0B1F3A] border border-[#1B2B48] rounded-xl p-6 flex items-center justify-center gap-3 text-xs text-[#94A3B8]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF9933]" />
                  <span>Synthesizing multi-factor analytical scores...</span>
                </div>
              )}

              {/* Interactive Candlestick & Volume Chart with TradingView Toggle */}
              <InteractiveChart
                bars={bars}
                technical={technical}
                symbol={currentSymbol}
              />

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
          {activeView === 'macro' && (
            <MacroDashboardView
              indicators={providerRouter.getMacroIndicators()}
              analysis={macro}
            />
          )}

          {/* CALCULATORS VIEW */}
          {activeView === 'calculators' && <CalculatorsView />}

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

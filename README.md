# ARTHA AI: AI-Powered Indian Financial Research & Intelligence Platform

> **Capabl Financial Research AI Agent Development Project (Dual Track) — Target: Track B (Advanced)**  
> **Prepared by:** Ramakrishna Janhvi | 4 October 2026  
> **Mandatory Disclaimer:** *For educational and informational purposes only. Not investment advice.*

---

## 1. Product Overview

**ARTHA AI** (*Artha* = wealth / economic value in Sanskrit) is an agentic, evidence-based financial intelligence and research platform tailored specifically for the Indian equity markets (NSE / BSE). 

Instead of acting as a generic conversational chatbot or stock price predictor, ARTHA AI behaves like a rigorous institutional equity research analyst:
- When a user inputs a query (e.g., *"Analyze RELIANCE.NS"* or *"Compare TCS and Infosys"*), a **12-Node LangGraph-style workflow** executes in real time.
- The pipeline ingests multi-source market data, computes deterministic technical indicators, audits fundamental ratios, scores FinBERT news sentiment with recency decay, checks sovereign macroeconomic benchmarks, and calculates portfolio risk metrics.
- Output includes a **Five-Pillar Composite Analytical Score (0–100)**, an interactive financial chart with technical overlays, side-by-side comparative radar graphs, an MPT portfolio optimizer with efficient frontier curves, what-if stress tests, and a downloadable **13-Section Evidence-Based PDF Research Report**.

---

## 2. Core Architecture & 12-Node Agent Pipeline

```
[User Query] "Analyze RELIANCE.NS"
     │
     ▼
[1. ResearchPlanner Node]  ── (Intent recognition & tool dependency formulation)
     │
     ├──────────────────────┬──────────────────────┬──────────────────────┐
     ▼                      ▼                      ▼                      ▼
[2. MarketDataNode]    [3. FundamentalNode]   [4. NewsSentimentNode] [5. MacroNode]
(180D OHLCV, Quotes)   (P/E, ROE, D/E, FCF)   (FinBERT probabilities) (RBI Repo, CPI, GDP)
     │                      │                      │                      │
     ├──────────────────────┴──────────────────────┴──────────────────────┤
     ▼                                                                    ▼
[6. TechnicalNode]                                                  [7. RiskNode]
(Wilder RSI, MACD, Bollinger, EMA 20/50/200, S/R pivots)           (Annualized Vol, Beta vs NIFTY,
                                                                     1D 95% VaR, CVaR, Sharpe)
     │                                                                    │
     └──────────────────────────────┬─────────────────────────────────────┘
                                    ▼
                          [8. ScoringNode]
               (Technical 25%, Fundamental 25%, Sentiment 15%,
                Risk Resilience 20%, Macro Transmission 15%)
                                    │
                                    ▼
                     [9. ResearchSynthesizer Node]
               (Evidence-grounded structured dossier generation)
                                    │
                                    ▼
                      [10. NumberValidator Node]
               (Strict check: rejects any unverified numbers)
                                    │
                                    ▼
                     [11. ComplianceChecker Node]
               (SEBI non-advice validation; neutralizes buy/sell)
                                    │
                                    ▼
                       [12. Final Report Node]
           (13 Structured Sections + 1-Click PDF Generation)
```

---

## 3. Mathematical Specifications & Formulas

| Category | Indicator / Metric | Mathematical Formulation | Parameters / Standard |
| :--- | :--- | :--- | :--- |
| **Technical** | Wilder's RSI | $RSI = 100 - \frac{100}{1 + RS}$ | Period 14, $\alpha = 1/14$ smoothing |
| **Technical** | MACD | $EMA_{12}(P) - EMA_{26}(P)$, Signal: $EMA_9$ | Exponential smoothing |
| **Technical** | Bollinger Bands | $SMA_{20}(P) \pm 2 \cdot \sigma_{20}(P)$ | 20-period, $2\sigma$ standard deviations |
| **Risk** | Annualized Volatility | $\sigma_{ann} = \text{std}(r_t) \times \sqrt{252}$ | Daily log returns $r_t = \ln(P_t / P_{t-1})$ |
| **Risk** | Beta vs NIFTY 50 | $\beta = \frac{\text{cov}(r_{stock}, r_{NIFTY})}{\text{var}(r_{NIFTY})}$ | 180-day rolling returns |
| **Risk** | Value at Risk (95%) | $\text{VaR}_{95} = -\text{percentile}(r_t, 5)$ | 1-Day holding period, 95% confidence |
| **Risk** | Conditional VaR (CVaR) | $\text{CVaR}_{95} = -\mathbb{E}[r_t \mid r_t \le -\text{VaR}]$ | Expected Shortfall in tail distribution |
| **Risk** | Sharpe Ratio | $S = \frac{\text{Ann Return} - r_f}{\sigma_{ann}}$ | Hurdle rate $r_f = 6.50\%$ (India G-Sec) |
| **Portfolio** | Modern Portfolio Theory | $\min w^T \Sigma w$ or $\max \frac{w^T \mu - r_f}{\sqrt{w^T \Sigma w}}$ | Long only, $\sum w_i = 1$, per-asset cap $\le 30\%$ |
| **Stress Test**| What-If Market Shock | $\text{Impact} = \sum (w_i \cdot \beta_i) \times \text{Shock} \times \text{Value}$ | Systematic factor transmission |
| **Derivatives**| Black-Scholes-Merton | $C = S e^{-qT} N(d_1) - K e^{-rT} N(d_2)$ | Continuous dividend yield $q$, Indian T-Bill $r$ |
| **Derivatives**| Futures Fair Value | $F = S \cdot e^{(r - q)T}, \quad \text{Basis} = F_{market} - F$ | Cost-of-carry formulation |
| **Fixed Income**| Modified Duration | $D^* = \frac{D_{Mac}}{1 + y/m}, \quad DV01 = P \cdot D^* \cdot 0.0001$ | Semi-annual compounding |

---

## 4. SEBI Regulatory Compliance & Non-Advice Safeguards

Under SEBI (Research Analysts) Regulations, non-registered platforms cannot issue stock tips, target prices, or personalized buy/sell calls. ARTHA AI complies strictly by design:
1. **No Recommendations:** Language is restricted to objective setup terminology (*"technical setup: bullish / neutral / bearish"*, *"supporting factors"*, *"analytical score"*).
2. **Deterministic Grounding:** All metrics originate from verified financial math models in code, never the language model's memory.
3. **Mandatory Disclaimer:** Displayed persistently on every page, report header, and PDF export:
   > *"ARTHA AI provides financial research and analytical information for educational and informational purposes only. It does not provide personalized investment advice, recommendations, or guarantees of returns. Users should conduct independent research and consult a qualified financial professional before making investment decisions."*

---

## 5. Live Demo Flow for Evaluation

1. **Stock Research & Candlestick Analysis:** Search for `RELIANCE.NS`, `TCS.NS`, `INFY.NS`, or `HDFCBANK.NS`. Inspect the candlestick chart, toggle SMA/EMA/Bollinger overlays and RSI/MACD sub-panes.
2. **Execute Agent Workflow:** Click **"Run Agent Analysis"** to watch the streaming 12-node LangGraph pipeline execute with latency and audited evidence counts.
3. **Inspect 13-Section Dossier & Download PDF:** Review the audited sections and click **"Download Full PDF Report"** to export the structured document.
4. **Dual-Stock Radar Compare:** Navigate to **"Compare Radar"** to benchmark TCS vs INFY or RELIANCE vs HDFCBANK side-by-side with radar charts.
5. **Portfolio & MPT Optimizer:** Navigate to **"Portfolio & MPT"** to view current equity holdings, run the Markowitz Efficient Frontier optimizer (Max Sharpe / Min Volatility), and slide the What-If market shock bar (-25% to +25%).
6. **Macro Transmission:** View India's 6 sovereign macro benchmarks (RBI Repo Rate, CPI, GDP, IIP, USD/INR, 10Y G-Sec) and toggle sector sensitivities.
7. **Quantitative Calculators:** Test the Black-Scholes-Merton Options Lab, Greek sensitivities, Put-Call Parity, Futures Cost-of-Carry, and Bond Duration.
8. **Grounded AI Assistant:** Open the floating assistant on any page to ask grounded analytical questions.

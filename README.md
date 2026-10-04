# ARTHA AI: Enterprise Financial Research & Intelligence Platform (India NSE/BSE)

> **Capabl Financial Research AI Agent Development Project (Dual Track) — Target: Track B (Advanced)**  
> **Built with:** TypeScript, Express server, Vite, React 19, Tailwind CSS v4, `@langchain/langgraph`, `@google/genai` (Gemini 3.8 Flash), Drizzle ORM (SQLite / PostgreSQL), Redis, jsPDF.  
> **Mandatory Regulatory Disclaimer:** *For educational and informational purposes only. Not personalized investment advice.*

---

## 1. Product Overview

**ARTHA AI** (*Artha* = economic value / wealth in Sanskrit) is an enterprise financial intelligence and research platform tailored specifically for Indian equities (NSE / BSE). 

Instead of acting as a generic conversational chatbot, ARTHA AI executes an automated **LangGraph StateGraph Workflow**:
- Ingests multi-source market data via an async **ProviderRouter** with **Opossum Circuit Breakers** (Yahoo Finance -> Alpha Vantage -> Cache -> Sample Fallback).
- Computes Wilder RSI(14), MACD(12,26,9), EMAs (20/50/200), and Bollinger Bands.
- Audits financial statements (P/E, P/B, ROE, ROCE, D/E, Free Cash Flow).
- Ingests news headlines and runs **FinBERT HuggingFace Sentiment Analysis** with 3-day exponential recency decay and 7-day momentum tracking.
- Evaluates RBI policy repo rate (6.50%), CPI inflation (5.12%), and GDP growth (7.4%) against sector transmission profiles.
- Models risk metrics: Annualized Volatility, Beta vs NIFTY 50 (^NSEI), 1-Day 95% VaR, CVaR Expected Shortfall, and Max Drawdown.
- Formulates a **Five-Pillar Composite Analytical Score (0–100)** and outputs a downloadable **13-Section Evidence-Based PDF Research Dossier**.

---

## 2. Technology Stack & Architecture

- **Backend**: Node.js, Express, TypeScript, `@langchain/langgraph`, `@langchain/google-genai`, `@google/genai` SDK.
- **Data Persistence**: Drizzle ORM with `better-sqlite3` (local dev) / PostgreSQL (production), Redis caching via `ioredis`.
- **Resilience**: `opossum` circuit breaker (trips after 5 failures in 60s for 120s cooldown), `p-retry` exponential backoff, per-provider rate limiting.
- **Frontend**: React 19, Vite, Tailwind CSS v4, `lightweight-charts`, `recharts`, `lucide-react`, `jspdf`.
- **Testing & Monitoring**: Vitest, Supertest, `prom-client` Prometheus metrics at `/api/metrics`, `/api/monitoring` dashboard.
- **Containerization**: Docker multi-stage build, `docker-compose.yml` (App, PostgreSQL, Redis).

---

## 3. LangGraph StateGraph Architecture

```
[User Query] "Analyze RELIANCE.NS"
     │
     ▼
[1. ResearchPlanner Node]  ── (Intent recognition & dependency graph formulation)
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
               (SEBI non-advice validation; neutralizes buy/sell; audit log)
                                    │
                                    ▼
                       [12. Final Report Node]
           (13 Structured Sections + 1-Click PDF Generation)
```

---

## 4. Honest Implemented vs Planned Checklist

| Feature | Status | Implementation Details |
|---|---|---|
| **LangGraph Real StateGraph Agent** | ✅ Implemented | Rebuilt `researchAgent.ts` with `@langchain/langgraph` `StateGraph` Annotation state & node fan-out. |
| **SSE Progress Streaming** | ✅ Implemented | `POST /api/research/run` streams real-time node updates over Server-Sent Events. |
| **Async ProviderRouter & Circuit Breakers** | ✅ Implemented | Yahoo Finance -> AlphaVantage -> Cache -> Sample Fallback with `opossum` breaker & `p-retry`. |
| **FinBERT Sentiment Analysis** | ✅ Implemented | HuggingFace FinBERT model integration with news deduplication & 3-day half-life decay. |
| **Drizzle ORM Database** | ✅ Implemented | SQLite database storing users, portfolios, holdings, watchlists, alerts, research runs, and audit logs. |
| **JWT Auth & Security Middleware** | ✅ Implemented | bcryptjs hashing, httpOnly JWT cookies, helmet headers, express-rate-limit, and symbol regex validation. |
| **Real-Time Alerts Engine** | ✅ Implemented | Cron market hours scanner broadcasting price, RSI, and volume alerts via WebSocket & SSE. |
| **Advanced Charting & Radar** | ✅ Implemented | Interactive SVG/Canvas candlestick chart with EMAs/RSI/MACD & Recharts comparison radar. |
| **Prometheus Metrics & Monitoring** | ✅ Implemented | `prom-client` counters at `/api/metrics` and real-time provider health dashboard at `/monitoring`. |
| **Unit Testing & CI Pipeline** | ✅ Implemented | 8 Vitest unit tests (calculators, MPT, circuit breaker), benchmark script, and `.github/workflows/ci.yml`. |
| **Docker & Docker Compose** | ✅ Implemented | Multi-stage `Dockerfile` and `docker-compose.yml` for App + PostgreSQL + Redis. |
| **Distributed Multi-Region Deployment** | ⏳ Planned | AWS ECS / Google Cloud Run geo-redundant deployment with global Redis cluster. |

---

## 5. Quick Start & Setup Instructions

### Environment Variables (.env)
Copy `.env.example` to `.env`:
```bash
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
ALPHAVANTAGE_API_KEY=your_alphavantage_key
NEWS_API_KEY=your_news_api_key
HF_TOKEN=your_huggingface_token
JWT_SECRET=artha-ai-super-secret-key-2026
DATABASE_URL=postgres://artha:artha123@localhost:5432/arthadb
REDIS_URL=redis://localhost:6379
```

### Installation & Local Run
```bash
# Install dependencies
npm i

# Run unit test suite
npm run test

# Run performance benchmark (generates docs/benchmarks.md)
npm run benchmark

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Docker Deployment
```bash
docker-compose up --build -d
```

---

## 6. Regulatory Compliance & Non-Advice Safeguards

Under SEBI (Research Analysts) Regulations, non-registered platforms cannot issue stock recommendations, target prices, or personalized buy/sell calls:
1. **Zero Directive Calls**: All language is restricted to objective setup observations.
2. **Strict Evidence Grounding**: Invented numbers are rejected by the `NumberValidator` node.
3. **Statutory Disclaimer**: Displayed on all views, dossiers, and exported PDF reports:
   > *"ARTHA AI provides financial research and analytical information for educational and informational purposes only. It does not provide personalized investment advice, recommendations, or guarantees of returns. Users should conduct independent research and consult a qualified financial professional before making investment decisions."*

---

## 7. Live Demo Flow for Evaluation

1. **Stock Research & Candlestick Analysis**: Search for `RELIANCE.NS`, `TCS.NS`, `INFY.NS`, or `HDFCBANK.NS`. Inspect candlestick chart, toggle SMA/EMA/Bollinger overlays and RSI/MACD sub-panes.
2. **Execute LangGraph Agent Workflow**: Click **"Run Agent Analysis"** to watch the streaming node-by-node pipeline execute with latency and evidence metrics.
3. **Inspect 13-Section Dossier & Download PDF**: Review audited research sections and click **"Download Full PDF Report"**.
4. **Dual-Stock Radar Compare**: Navigate to **"Compare Radar"** to benchmark TCS vs INFY side-by-side.
5. **Portfolio & MPT Optimizer**: Navigate to **"Portfolio & MPT"** to view current equity holdings, run Markowitz Efficient Frontier optimization (`Max Sharpe` / `Min Volatility`), and slide the What-If market shock bar (-25% to +25%).
6. **Real-Time Alerts Engine**: Navigate to **"Alerts"** to configure indicator rules and view live triggered SSE events.
7. **System Health & Prometheus Monitoring**: Navigate to **"Monitoring"** to inspect live API provider circuit breaker states and request audit logs. View Prometheus text metrics at `http://localhost:3000/api/metrics`.

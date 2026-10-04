# ARTHA AI REST & Real-Time API Specification

## Authentication Endpoints
- `POST /api/auth/register` — Register a new user (`email`, `password`)
- `POST /api/auth/login` — Authenticate and set HTTP-only JWT cookies
- `POST /api/auth/logout` — Clear auth cookies
- `GET /api/auth/me` — Return current authenticated session details

## Market & Quantitative Data
- `GET /api/market/status` — Get current Indian market trading session status (IST)
- `GET /api/market/search?q=:query` — Search NSE/BSE universe
- `GET /api/market/quote/:symbol` — Get live/recent price quote
- `GET /api/market/history/:symbol` — Get 180-day daily OHLCV series
- `GET /api/analysis/technical/:symbol` — Get Wilder RSI(14), MACD, EMAs, and Pivot levels
- `GET /api/analysis/fundamental/:symbol` — Get audited P/E, P/B, ROE, ROCE, and growth ratios
- `GET /api/analysis/sentiment/:symbol` — Get FinBERT news sentiment and 7-day momentum
- `GET /api/analysis/risk/:symbol` — Get Volatility, Beta vs NIFTY, 1D 95% VaR, CVaR, and Max Drawdown

## Agentic AI Research Engine
- `POST /api/research/run` — Run complete LangGraph StateGraph research workflow (Supports SSE streaming when `Accept: text/event-stream`)
- `POST /api/research/compare` — Compare two Indian stocks across radar categories

## Portfolio & MPT Optimization
- `GET /api/portfolios` — Get user portfolio holdings & analytics
- `POST /api/portfolios/optimize` — Run Markowitz Efficient Frontier optimization (`MIN_RISK`, `MAX_SHARPE`, `BALANCED`)
- `POST /api/portfolios/whatif` — Simulate market shock (-10% NIFTY delta)

## Real-Time Alerts & Monitoring
- `GET /api/alerts` — List active alert rules & triggered events
- `POST /api/alerts` — Create a new indicator alert rule
- `GET /api/alerts/stream` — SSE stream of real-time market alerts
- `GET /api/metrics` — Prometheus metrics format endpoint
- `GET /api/monitoring` — Real-time provider circuit breaker states & request audit logs

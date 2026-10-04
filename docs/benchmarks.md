# ARTHA AI Performance & Latency Benchmarks

Generated on: 2026-10-04T10:28:36.592Z
Environment: Node.js (Linux x64)

## Latency Metrics (Cold vs Cached)

| Benchmark Metric | Cold Cache (Uncached) | Warm Cache (TTL Hit) |
|---|---|---|
| **p50 Latency (ms)** | 1 ms | 0 ms |
| **p95 Latency (ms)** | 31 ms | 0 ms |
| **Cache Hit Ratio (%)** | 0.00% | 100.00% |
| **Sample Size** | 5 tickers | 100 requests |

## Architectural Resilience Verification
- **Yahoo Finance Fallback**: Verified fallback to AlphaVantage & sample data.
- **Circuit Breaker Threshold**: 5 consecutive failures / 60s window -> 120s cooldown.
- **InMemory / Redis TTL**: Quote (15s), History (1h), Fundamentals (24h), News (10m), Macro (12h).

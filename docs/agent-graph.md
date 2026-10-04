# LangGraph StateGraph Architecture

This Mermaid diagram illustrates the active `@langchain/langgraph` agent workflow powering ARTHA AI research dossier generation.

```mermaid
graph TD
  START --> planner["ResearchPlanner (Intent & Dependency Decomposition)"]
  planner --> marketData["MarketDataNode (Yahoo/AlphaVantage Quotes & History)"]
  planner --> fundamentalData["FundamentalNode (Audited P/E, P/B, ROE Ratios)"]
  planner --> newsData["NewsSentimentNode (NewsAPI/RSS & FinBERT Ingestion)"]
  marketData --> macroData["MacroNode (RBI Repo Rate, Inflation & Sector Sensitivity)"]
  macroData --> analyticsEngine["AnalyticsEngine (Technical RSI, MACD & Risk VaR/Beta)"]
  fundamentalData --> analyticsEngine
  newsData --> analyticsEngine
  analyticsEngine --> scoringNode["ScoringNode (5-Pillar Weighted Composite Score)"]
  scoringNode --> numberValidator["NumberValidator (Strict Tool Evidence Grounding Check)"]
  numberValidator --> complianceChecker["ComplianceChecker (SEBI Non-Advice & Audit Log)"]
  complianceChecker --> END
```

## State Definition
The StateGraph maintains a strictly typed Annotation state:
- `query`, `intent`, `symbol`, `quote`, `bars`, `fundamentals`, `news`, `sentiment`, `macro`, `technical`, `risk`, `scores`, `evidence`, `draft`, `report`, `warnings`, `trace`.

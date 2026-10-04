# Building ARTHA AI: Solving Engineering & Compliance Challenges in Indian Financial Research

## Introduction
Building an AI-powered financial research platform for the Indian equity market (NSE/BSE) presents unique challenges: handling high volatility, adhering to SEBI non-advice regulations, eliminating LLM hallucinations, and maintaining microsecond-level query performance.

In this post, we explore how ARTHA AI addresses these challenges using an async ProviderRouter with circuit breakers, a stateful LangGraph agent graph, FinBERT sentiment scoring, and deterministic evidence validation.

## 1. Multi-Tiered Provider Fallback & Circuit Breakers
External financial APIs frequently experience rate limits or downtime. To guarantee 99.9% uptime:
- We built an async **ProviderRouter** that attempts Yahoo Finance, falls back to Alpha Vantage, checks Redis/In-Memory TTL cache, and defaults to a deterministic demo mode.
- An **Opossum-style Circuit Breaker** trips OPEN after 5 failures in 60s, preventing cascading system slowdowns.

## 2. Stateful LangGraph Agent & Zero-Hallucination Evidence Checking
Large Language Models tend to invent numerical figures. ARTHA AI solves this via:
- **Annotation State Graph**: Orchestrates planning, data ingestion, technical/risk/sentiment analytics, and composite scoring.
- **NumberValidator Node**: Audits all generated text against calculated tool evidence. If unverified numbers are detected, the output is rejected and regenerated.

## 3. SEBI Regulatory Compliance
To operate legally as an analytical tool in India:
- We enforce strict non-advice constraints: zero buy/sell recommendations, zero price targets, and persistent statutory disclaimers.

## Conclusion
By combining rigorous quantitative engines with modern agentic AI workflows, ARTHA AI delivers high-precision, compliant equity intelligence for Indian investors.

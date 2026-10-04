# SEBI Non-Advice & Regulatory Compliance Policy

## Mandatory Rules Enforced by ARTHA AI Engine
1. **Zero Recommendation Output**: The system strictly forbids issuing "Buy", "Sell", "Hold", "Strong Buy", or "Strong Sell" directives.
2. **Elimination of Target Prices**: No target price forecasts, guaranteed return percentages, or price predictions are produced.
3. **Numeric Grounding Guard**: Every numerical figure cited in research dossiers or chat outputs must map directly to calculated tool outputs in the `evidence` object.
4. **Statutory Regulatory Disclaimer**: Every generated research report, chat response, and exported PDF report concludes with the statutory disclaimer:
   > *"ARTHA AI provides financial research and analytical information for educational and informational purposes only. It does not provide personalized investment advice, recommendations, or guarantees of returns. Users should conduct independent research and consult a qualified financial professional before making investment decisions."*
5. **Audit Logging**: Every compliance rewrite, report generation, and user login is recorded to the immutable `audit_logs` database table.

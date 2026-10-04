# ARTHA AI Security Threat Model & Controls

## Threat Model
1. **Unauthenticated Access**: Unauthorized access to portfolio CRUD and research APIs.
2. **Prompt Injection**: Malicious external news articles trying to override system prompts or execute arbitrary instructions.
3. **API Rate Abuse / Replay**: Denial of Service (DoS) attacks on expensive LLM agent endpoints.
4. **Secret Exposure**: Leakage of API keys (Gemini, AlphaVantage, NewsAPI, HuggingFace) in client-side bundles.

## Implemented Security Controls
- **JWT Authentication**: Short-lived (15 min) access tokens and 7-day refresh tokens stored in `httpOnly`, `sameSite` cookies.
- **Input Sanitization**: Regex validation (`^[A-Z0-9&\-\^]{1,20}(\.(NS|BO))?$`) for symbols; prompt-injection stripping on external news headlines.
- **Rate Limiting**: `express-rate-limit` restricting general requests to 60/min and research runs to 10/min.
- **Security Headers**: `helmet` enabled with strict content security policies and CORS origin whitelist.
- **Zero Client Secrets**: All external API keys remain strictly on the backend server environment.

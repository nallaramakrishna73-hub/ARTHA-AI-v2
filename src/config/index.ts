/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const DISCLAIMER_TEXT =
  "ARTHA AI provides financial research and analytical information for educational and informational purposes only. It does not provide personalized investment advice, recommendations, or guarantees of returns. Users should conduct independent research and consult a qualified financial professional before making investment decisions.";

export const APP_CONFIG = {
  name: "ARTHA AI",
  tagline: "Financial Research Intelligence | India",
  timezone: "Asia/Kolkata",
  currency: "INR",
  currencySymbol: "₹",
  riskFreeRate: 0.065, // 6.5% standard Indian 91-day T-Bill / G-Sec proxy
  weights: {
    technical: 0.25,
    fundamental: 0.25,
    sentiment: 0.15,
    riskResilience: 0.20,
    macro: 0.15,
  },
  marketHours: {
    openHour: 9,
    openMinute: 15,
    closeHour: 15,
    closeMinute: 30,
    days: [1, 2, 3, 4, 5], // Monday - Friday
  },
  benchmarks: {
    nifty50: "^NSEI",
    sensex: "^BSESN",
  },
};

export const INDIAN_HOLIDAYS_2026: { [date: string]: string } = {
  "2026-01-26": "Republic Day",
  "2026-03-03": "Holi",
  "2026-03-20": "Id-Ul-Fitr (Ramzan Id)",
  "2026-04-03": "Good Friday",
  "2026-04-14": "Dr. Baba Saheb Ambedkar Jayanti",
  "2026-05-01": "Maharashtra Day",
  "2026-05-27": "Bakri Id",
  "2026-08-15": "Independence Day",
  "2026-09-04": "Janmashtami",
  "2026-10-02": "Mahatma Gandhi Jayanti",
  "2026-10-20": "Dussehra",
  "2026-11-08": "Diwali Laxmi Pujan",
  "2026-11-10": "Diwali Balipratipada",
  "2026-11-24": "Gurunanak Jayanti",
  "2026-12-25": "Christmas",
};

export const SECTOR_MAPPING: {
  [sector: string]: {
    rateSensitivity: 'HIGH_NEGATIVE' | 'HIGH_POSITIVE' | 'MODERATE' | 'LOW';
    fxSensitivity: 'BENEFICIARY' | 'ADVERSE' | 'NEUTRAL';
    inflationSensitivity: 'VULNERABLE' | 'RESILIENT' | 'PASS_THROUGH';
    description: string;
  };
} = {
  "Financial Services": {
    rateSensitivity: "HIGH_POSITIVE", // Higher rates can benefit NIMs initially but increase credit risk
    fxSensitivity: "NEUTRAL",
    inflationSensitivity: "RESILIENT",
    description: "Net interest margins expand with rate pauses/hikes; monitored for asset quality and credit growth.",
  },
  "Information Technology": {
    rateSensitivity: "LOW",
    fxSensitivity: "BENEFICIARY", // Weak INR / Strong USD benefits export revenue
    inflationSensitivity: "RESILIENT",
    description: "Export-oriented sector benefiting from INR depreciation against USD and robust global enterprise IT spending.",
  },
  "Energy & Petrochemicals": {
    rateSensitivity: "MODERATE",
    fxSensitivity: "ADVERSE", // Rupee depreciation increases crude import bill
    inflationSensitivity: "PASS_THROUGH",
    description: "High sensitivity to global Brent crude benchmarks and gross refining margins (GRMs).",
  },
  "Telecommunications": {
    rateSensitivity: "MODERATE",
    fxSensitivity: "NEUTRAL",
    inflationSensitivity: "PASS_THROUGH",
    description: "Capital intensive with high 5G capex; benefits from tariff revisions and rising ARPU.",
  },
  "Automotive": {
    rateSensitivity: "HIGH_NEGATIVE", // Higher vehicle loan rates dampen consumer demand
    fxSensitivity: "NEUTRAL",
    inflationSensitivity: "VULNERABLE",
    description: "Interest-rate sensitive due to consumer financing reliance; commodity input cost variations.",
  },
  "Fast-Moving Consumer Goods": {
    rateSensitivity: "LOW",
    fxSensitivity: "NEUTRAL",
    inflationSensitivity: "VULNERABLE",
    description: "Defensive profile with steady volume growth; raw material inflation impacts gross margins.",
  },
  "Infrastructure & Capital Goods": {
    rateSensitivity: "HIGH_NEGATIVE",
    fxSensitivity: "NEUTRAL",
    inflationSensitivity: "VULNERABLE",
    description: "Order book momentum heavily dependent on national infrastructure capex and borrowing costs.",
  },
};

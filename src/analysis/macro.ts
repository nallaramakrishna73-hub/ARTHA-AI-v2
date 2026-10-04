/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MacroAnalysisResult } from '../types/index.ts';
import { MACRO_DATA } from '../data/sampleData.ts';
import { SECTOR_MAPPING } from '../config/index.ts';

export function analyzeMacro(sector: string): MacroAnalysisResult {
  const sensitivities = Object.entries(SECTOR_MAPPING).map(([sec, mapping]) => ({
    sector: sec,
    rateSensitivity: mapping.rateSensitivity,
    fxSensitivity: mapping.fxSensitivity,
    inflationSensitivity: mapping.inflationSensitivity,
    summary: mapping.description,
  }));

  const targetMapping = SECTOR_MAPPING[sector] || {
    rateSensitivity: "MODERATE" as const,
    fxSensitivity: "NEUTRAL" as const,
    inflationSensitivity: "RESILIENT" as const,
    description: "Sector tracks general Indian macroeconomic expansion and industrial capital expenditure.",
  };

  // Base Indian macro score (steady GDP growth 7.4%, inflation inside RBI 4% +/- 2% band, high forex reserves)
  let macroScore = 74;

  if (targetMapping.rateSensitivity === "HIGH_NEGATIVE") {
    // Current 6.50% pause rate exerts mild pressure on rate-sensitive borrowing
    macroScore -= 5;
  } else if (targetMapping.rateSensitivity === "HIGH_POSITIVE") {
    macroScore += 4;
  }

  if (targetMapping.fxSensitivity === "BENEFICIARY") {
    // Current USD/INR at 83.82 provides tailwinds to software/exporters
    macroScore += 6;
  }

  macroScore = Math.min(95, Math.max(45, macroScore));

  let narrative = `Indian macroeconomic conditions remain expansionary with real GDP growing at 7.4% and CPI inflation well within the RBI corridor at 5.12%. For the ${sector} sector, `;
  if (targetMapping.fxSensitivity === "BENEFICIARY") {
    narrative += `the steady USD/INR exchange rate supports offshore billings and dollar contract realizations. `;
  } else if (targetMapping.rateSensitivity === "HIGH_POSITIVE") {
    narrative += `credit demand across retail and SME segments continues to support balance sheet expansion while stable repo rates preserve net interest margins. `;
  } else {
    narrative += `domestic capital goods demand and industrial output (IIP +5.4%) provide strong underlying tailwinds. `;
  }

  return {
    indicators: MACRO_DATA,
    macroScore,
    sectorSensitivities: sensitivities,
    currentSectorAssessment: {
      sector,
      score: macroScore,
      narrative,
    },
  };
}

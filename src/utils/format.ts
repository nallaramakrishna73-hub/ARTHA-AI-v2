/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Format a number into the Indian numbering system:
 * e.g., 1234567.89 -> 12,34,567.89
 */
export function formatINR(val: number, decimals: number = 2): string {
  if (val === undefined || val === null || isNaN(val)) return "₹0.00";
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  const parts = absVal.toFixed(decimals).split(".");
  let intPart = parts[0];
  const decPart = parts.length > 1 ? "." + parts[1] : "";

  // Indian comma logic: last 3 digits, then groups of 2
  if (intPart.length > 3) {
    const lastThree = intPart.substring(intPart.length - 3);
    const otherNumbers = intPart.substring(0, intPart.length - 3);
    intPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }

  return (isNegative ? "-₹" : "₹") + intPart + decPart;
}

/**
 * Format market cap or large figures into Lakh / Crore:
 * e.g. 2045000 (Cr) -> ₹20.45 Lakh Cr
 */
export function formatLakhCrore(crores: number): string {
  if (crores === undefined || crores === null || isNaN(crores)) return "₹0 Cr";
  if (crores >= 100000) {
    return `₹${(crores / 100000).toFixed(2)} Lakh Cr`;
  }
  return `₹${crores.toLocaleString("en-IN", { maximumFractionDigits: 1 })} Cr`;
}

/**
 * Format signed percentages with explicit +/- sign
 */
export function formatPercent(val: number, decimals: number = 2): string {
  if (val === undefined || val === null || isNaN(val)) return "0.00%";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(decimals)}%`;
}

/**
 * Return appropriate text color for signed numbers
 */
export function getPercentColorClass(val: number): string {
  if (val > 0) return "text-[#16A34A]"; // Positive green
  if (val < 0) return "text-[#E5484D]"; // Negative red
  return "text-[#94A3B8]"; // Neutral
}

/**
 * Format number with Indian separators without currency symbol
 */
export function formatIndianNumber(val: number, decimals: number = 2): string {
  if (val === undefined || val === null || isNaN(val)) return "0";
  return val.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format current timestamp to IST Asia/Kolkata
 */
export function getISTTimestamp(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date) + " IST";
}

/**
 * Checks if the Indian Market is currently OPEN or CLOSED
 * 09:15 - 15:30 IST, Mon-Fri, excluding holidays
 */
export function getMarketSessionStatus(): {
  isOpen: boolean;
  sessionText: string;
  timeRemaining: string;
  nextSessionText: string;
} {
  // Convert current time to Asia/Kolkata
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istString);

  const dayOfWeek = istDate.getDay(); // 0 is Sunday, 6 is Saturday
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const currentMinuteOfDay = hours * 60 + minutes;

  const openMinute = 9 * 60 + 15; // 09:15
  const closeMinute = 15 * 60 + 30; // 15:30

  // Format YYYY-MM-DD
  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, "0");
  const dd = String(istDate.getDate()).padStart(2, "0");
  const dateKey = `${yyyy}-${mm}-${dd}`;

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (isWeekend) {
    return {
      isOpen: false,
      sessionText: "Weekend Closed",
      timeRemaining: "Market opens Monday 09:15 IST",
      nextSessionText: "Regular trading resumes Monday 09:15 AM",
    };
  }

  if (currentMinuteOfDay < openMinute) {
    const minsUntilOpen = openMinute - currentMinuteOfDay;
    const h = Math.floor(minsUntilOpen / 60);
    const m = minsUntilOpen % 60;
    return {
      isOpen: false,
      sessionText: "Pre-Market / Closed",
      timeRemaining: `Opens in ${h > 0 ? `${h}h ` : ""}${m}m`,
      nextSessionText: "Regular trading starts today at 09:15 AM IST",
    };
  }

  if (currentMinuteOfDay >= openMinute && currentMinuteOfDay <= closeMinute) {
    const minsRemaining = closeMinute - currentMinuteOfDay;
    const h = Math.floor(minsRemaining / 60);
    const m = minsRemaining % 60;
    return {
      isOpen: true,
      sessionText: "Market OPEN",
      timeRemaining: `Closes in ${h > 0 ? `${h}h ` : ""}${m}m`,
      nextSessionText: "Session in progress: 09:15 - 15:30 IST",
    };
  }

  return {
    isOpen: false,
    sessionText: "Market CLOSED",
    timeRemaining: "Last close prices active",
    nextSessionText: "Next session tomorrow 09:15 AM IST",
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getMarketSessionStatus, getISTTimestamp } from '../utils/format.ts';
import { Clock } from 'lucide-react';

export const MarketStatusBadge: React.FC = () => {
  const [status, setStatus] = useState(getMarketSessionStatus());
  const [istTime, setIstTime] = useState(getISTTimestamp());

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(getMarketSessionStatus());
      setIstTime(getISTTimestamp());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#070F1F] border border-[#1B2B48]">
        <div
          className={`w-2 h-2 rounded-full ${
            status.isOpen
              ? 'bg-[#16A34A] animate-pulse'
              : 'bg-[#E5484D]'
          }`}
        />
        <span className="font-semibold text-white tracking-wide">
          {status.sessionText}
        </span>
        <span className="text-[#64748B]">·</span>
        <span className="text-[#94A3B8]">{status.timeRemaining}</span>
      </div>

      <div className="hidden lg:flex items-center gap-1.5 text-[#94A3B8]">
        <Clock className="w-3.5 h-3.5 text-[#FF9933]" />
        <span className="font-mono-numbers">{istTime}</span>
      </div>
    </div>
  );
};

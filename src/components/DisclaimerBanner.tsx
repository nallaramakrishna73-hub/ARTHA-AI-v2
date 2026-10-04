/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DISCLAIMER_TEXT } from '../config/index.ts';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <footer className="border-t border-[#1B2B48] bg-[#070F1F]/90 backdrop-blur-md px-4 py-3 mt-auto">
      <div className="max-w-7xl mx-auto flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed text-[#94A3B8]">
          <span className="font-semibold text-white uppercase tracking-wider mr-1.5">
            SEBI Regulatory & Research Notice:
          </span>
          {DISCLAIMER_TEXT}
        </div>
      </div>
    </footer>
  );
};

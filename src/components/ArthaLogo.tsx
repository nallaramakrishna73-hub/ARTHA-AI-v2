/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ArthaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const ArthaLogo: React.FC<ArthaLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const iconSizes = {
    sm: { w: 32, h: 32, fontSize: 'text-lg', subSize: 'text-[9px]' },
    md: { w: 40, h: 40, fontSize: 'text-xl', subSize: 'text-[10px]' },
    lg: { w: 52, h: 52, fontSize: 'text-2xl', subSize: 'text-xs' },
    xl: { w: 68, h: 68, fontSize: 'text-3xl', subSize: 'text-sm' },
  };

  const current = iconSizes[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SVG Icon based on brand specs */}
      <svg
        width={current.w}
        height={current.h}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
      >
        {/* Rounded Container */}
        <rect width="100" height="100" rx="22" fill="#0B1F3A" />

        {/* Letter A Limbs (White) */}
        <path
          d="M26 78L49 24C49.5 22.8 50.5 22.8 51 24L74 78"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Artha Insight Point (Apex Green Node) */}
        <circle cx="50" cy="18" r="7" fill="#138808" />

        {/* Saffron Zig-Zag Chart Line Crossbar */}
        <path
          d="M37 64L45 53L51 60L60 48"
          stroke="#FF9933"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Chart Line Terminal Node */}
        <circle cx="60" cy="48" r="4.5" fill="#FF9933" />

        {/* India Tricolor Base Bar Dashes */}
        <rect x="33" y="84" width="10" height="3" rx="1.5" fill="#FF9933" />
        <rect x="45" y="84" width="10" height="3" rx="1.5" fill="#FFFFFF" />
        <rect x="57" y="84" width="10" height="3" rx="1.5" fill="#138808" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col">
        <div className={`font-bold tracking-tight leading-none ${current.fontSize}`}>
          <span className="text-white">ARTHA</span>{' '}
          <span className="text-[#FF9933]">AI</span>
        </div>
        {showTagline && (
          <span className={`text-[#94A3B8] font-medium tracking-wider uppercase mt-1 ${current.subSize}`}>
            Financial Research Intelligence · India
          </span>
        )}
      </div>
    </div>
  );
};

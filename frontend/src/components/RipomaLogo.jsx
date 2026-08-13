/**
 * RipomaLogo — Centralized brand logo component
 *
 * Props:
 *   variant  : "full" | "compact" | "icon"
 *              full    = wordmark + icon + "FARM" sub-line
 *              compact = wordmark + icon (no sub-line)
 *              icon    = leaf-in-circle mark only
 *
 *   color    : "color" | "white" | "mono"
 *              color  = black text, green icon gradient (default, light bg)
 *              white  = white text, green icon gradient (dark bg)
 *              mono   = all black/white, for print / packing slips
 *
 *   height   : number (px) — sets the rendered height; width scales proportionally
 *   className: additional classes
 */
import React from 'react';

const RipomaLogo = ({
  variant   = 'full',
  color     = 'color',
  height    = 40,
  className = '',
  style     = {},
}) => {
  const isWhite = color === 'white';
  const mono    = color === 'mono';

  // Text & sub-line color
  const textColor  = isWhite ? '#FFFFFF' : mono ? '#000000' : '#0F172A';
  const subColor   = isWhite ? '#FFFFFF' : mono ? '#000000' : '#334155';
  const iconStroke = mono ? '#000000' : '#4CAF50';

  // Aspect ratio calculations: full ≈ 340/110 = 3.09, compact ≈ 340/80 = 4.25, icon = 1
  const aspectRatios = { full: 3.09, compact: 4.25, icon: 1 };
  const ar = aspectRatios[variant] ?? 3.09;
  const width = Math.round(height * ar);

  const svgProps = {
    style: { height, width, display: 'inline-block', ...style },
    className,
  };

  const gradientPrefix = `ripoma-g-${variant}-${color}`;

  if (variant === 'icon') {
    return (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
        {!mono && (
          <defs>
            <linearGradient id={`${gradientPrefix}-leaf`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#66BB6A" />
              <stop offset="100%" stopColor="#1B5E20" />
            </linearGradient>
            <linearGradient id={`${gradientPrefix}-hill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4CAF50" />
              <stop offset="100%" stopColor="#2E7D32" />
            </linearGradient>
          </defs>
        )}
        <circle cx="28" cy="28" r="24" fill="none" stroke={iconStroke} strokeWidth="2.5" />
        <path
          d="M28 10 C26 17 21 24 22 33 C25 30 27 27 28 24 C29 27 31 30 34 33 C35 24 30 17 28 10 Z"
          fill={mono ? '#000' : `url(#${gradientPrefix}-leaf)`}
        />
        <path
          d="M21 16 C15 20 12 27 15 34 C18 29 20 25 23 23 C22 20 21.5 18 21 16 Z"
          fill={mono ? '#000' : `url(#${gradientPrefix}-leaf)`}
          opacity="0.9"
        />
        <path
          d="M35 16 C41 20 44 27 41 34 C38 29 36 25 33 23 C34 20 34.5 18 35 16 Z"
          fill={mono ? '#000' : `url(#${gradientPrefix}-leaf)`}
          opacity="0.9"
        />
        <ellipse cx="28" cy="39" rx="10" ry="4.5" fill={mono ? '#333' : `url(#${gradientPrefix}-hill)`} opacity="0.7" />
        <path d="M18 39 Q28 34 38 39" fill="none" stroke={mono ? '#333' : '#4CAF50'} strokeWidth="1.5" opacity="0.8" />
      </svg>
    );
  }

  const compact = variant === 'compact';
  const viewBoxH = compact ? 80 : 110;

  return (
    <svg
      viewBox={`0 0 340 ${viewBoxH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      {!mono && (
        <defs>
          <linearGradient id={`${gradientPrefix}-leaf`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#66BB6A" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id={`${gradientPrefix}-hill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
        </defs>
      )}

      {/* RIP Wordmark */}
      <text
        x="45"
        y="60"
        fontFamily="'Arial Black', 'Impact', 'Oswald', sans-serif"
        fontWeight="900"
        fontSize="58"
        letterSpacing="-1"
        fill={textColor}
      >
        RIP
      </text>

      {/* Leaf-in-Circle Icon (The "O") */}
      <g transform="translate(142, 4)">
        <circle cx="28" cy="28" r="24" fill="none" stroke={iconStroke} strokeWidth="2.8" />
        {/* Main Center Leaf */}
        <path
          d="M28 10 C26 17 21 24 22 33 C25 30 27 27 28 24 C29 27 31 30 34 33 C35 24 30 17 28 10 Z"
          fill={mono ? '#000' : `url(#${gradientPrefix}-leaf)`}
        />
        {/* Left Leaf */}
        <path
          d="M21 16 C15 20 12 27 15 34 C18 29 20 25 23 23 C22 20 21.5 18 21 16 Z"
          fill={mono ? '#000' : `url(#${gradientPrefix}-leaf)`}
          opacity="0.9"
        />
        {/* Right Leaf */}
        <path
          d="M35 16 C41 20 44 27 41 34 C38 29 36 25 33 23 C34 20 34.5 18 35 16 Z"
          fill={mono ? '#000' : `url(#${gradientPrefix}-leaf)`}
          opacity="0.9"
        />
        {/* Ground Hill */}
        <ellipse cx="28" cy="39" rx="10" ry="4.5" fill={mono ? '#333' : `url(#${gradientPrefix}-hill)`} opacity="0.7" />
        <path d="M18 39 Q28 34 38 39" fill="none" stroke={mono ? '#333' : '#4CAF50'} strokeWidth="1.5" opacity="0.8" />
      </g>

      {/* MA Wordmark */}
      <text
        x="198"
        y="60"
        fontFamily="'Arial Black', 'Impact', 'Oswald', sans-serif"
        fontWeight="900"
        fontSize="58"
        letterSpacing="-1"
        fill={textColor}
      >
        MA
      </text>

      {/* FARM Subline */}
      {!compact && (
        <g transform="translate(0, 72)">
          {/* Left Line */}
          <line x1="45" y1="18" x2="124" y2="18" stroke={subColor} strokeWidth="1.5" opacity="0.9" />
          {/* Left Leaf Accent */}
          <path
            d="M120 13 C117 11 114 13 116 17 C117.5 15 119 13.5 120 13 Z"
            fill={subColor}
            opacity="0.9"
          />

          {/* FARM Text */}
          <text
            x="170"
            y="23"
            fontFamily="'Arial', sans-serif"
            fontWeight="800"
            fontSize="16"
            letterSpacing="6"
            textAnchor="middle"
            fill={subColor}
          >
            FARM
          </text>

          {/* Right Leaf Accent */}
          <path
            d="M220 13 C223 11 226 13 224 17 C222.5 15 221 13.5 220 13 Z"
            fill={subColor}
            opacity="0.9"
          />
          {/* Right Line */}
          <line x1="216" y1="18" x2="295" y2="18" stroke={subColor} strokeWidth="1.5" opacity="0.9" />
        </g>
      )}
    </svg>
  );
};

export default RipomaLogo;

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
 *
 * Usage examples:
 *   <RipomaLogo />                                  → full, color, height 40
 *   <RipomaLogo variant="compact" color="white" height={32} />
 *   <RipomaLogo variant="icon" height={28} />
 *   <RipomaLogo variant="full" color="mono" height={48} />
 */
import React from 'react';

/* ─── Shared leaf-in-circle icon paths (in a 56×56 viewBox) ─────── */
const LeafIcon = ({ mono = false }) => {
  const circleStroke  = mono ? '#000' : '#1B5E20';
  const leafFill      = mono ? '#000' : 'url(#leafGrad)';
  const hillFill      = mono ? '#333' : 'url(#hillGrad)';

  return (
    <>
      {!mono && (
        <defs>
          <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#5FAE3E" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3A8A2B" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
        </defs>
      )}
      {/* Circle outline */}
      <circle cx="28" cy="28" r="24" fill="none" stroke={circleStroke} strokeWidth="2.5" />

      {/* Center tall leaf */}
      <path
        d="M28 12 C26 18 22 24 23 32 C25 30 27 28 28 26 C29 28 31 30 33 32 C34 24 30 18 28 12 Z"
        fill={leafFill}
      />
      {/* Left leaf */}
      <path
        d="M21 17 C16 20 13 26 16 32 C18 28 20 25 23 23 C22 21 21.5 19 21 17 Z"
        fill={leafFill}
        opacity="0.85"
      />
      {/* Right leaf */}
      <path
        d="M35 17 C40 20 43 26 40 32 C38 28 36 25 33 23 C34 21 34.5 19 35 17 Z"
        fill={leafFill}
        opacity="0.85"
      />
      {/* Ground/hill */}
      <ellipse cx="28" cy="37" rx="9" ry="4" fill={hillFill} opacity="0.6" />
      <path d="M19 37 Q28 32 37 37" fill="none" stroke={hillFill} strokeWidth="1.5" opacity="0.8" />
    </>
  );
};

/* ─── Icon-only variant ──────────────────────────────────────────── */
const IconOnly = ({ color }) => {
  const mono = color === 'mono';
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <LeafIcon mono={mono} />
    </svg>
  );
};

/* ─── Full / Compact wordmark ────────────────────────────────────── */
const WordmarkLogo = ({ color, compact = false }) => {
  const mono        = color === 'mono';
  const isWhite     = color === 'white';
  const textColor   = isWhite ? '#FFFFFF' : mono ? '#000000' : '#111111';
  const subColor    = isWhite ? '#FFFFFF' : mono ? '#000000' : '#1B5E20';
  const ruleOpacity = isWhite ? 0.7 : 1;

  /*
   * Layout (viewBox units):
   *  "RIP" = 3 chars × ~50px wide = 150
   *  icon  = 56 wide
   *  "MA"  = 2 chars × ~50px wide = 100
   *  total ≈ 320 wide
   *  plus padding left/right = 340
   *
   * For compact: height = 80 (just the wordmark row)
   * For full:    height = 110 (wordmark + FARM sub-line)
   */

  const W = 340;
  const H = compact ? 80 : 110;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {!mono && (
        <defs>
          <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#5FAE3E" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3A8A2B" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
        </defs>
      )}

      {/* "RIP" text — heavy weight, aligned to left of icon */}
      <text
        x="10"
        y="60"
        fontFamily="'Arial Black', 'Impact', sans-serif"
        fontWeight="900"
        fontSize="58"
        letterSpacing="-1"
        fill={textColor}
      >
        RIP
      </text>

      {/* Leaf-in-circle icon in place of the "O" */}
      <g transform="translate(152, 4)">
        <circle
          cx="28" cy="28" r="24"
          fill="none"
          stroke={mono ? '#000' : '#1B5E20'}
          strokeWidth="2.5"
        />
        {/* Center leaf */}
        <path
          d="M28 10 C26 17 21 24 22 33 C25 30 27 27 28 24 C29 27 31 30 34 33 C35 24 30 17 28 10 Z"
          fill={mono ? '#000' : 'url(#leafGrad)'}
        />
        {/* Left leaf */}
        <path
          d="M21 16 C15 20 12 27 15 34 C18 29 20 25 23 23 C22 20 21.5 18 21 16 Z"
          fill={mono ? '#000' : 'url(#leafGrad)'}
          opacity="0.85"
        />
        {/* Right leaf */}
        <path
          d="M35 16 C41 20 44 27 41 34 C38 29 36 25 33 23 C34 20 34.5 18 35 16 Z"
          fill={mono ? '#000' : 'url(#leafGrad)'}
          opacity="0.85"
        />
        {/* Ground hill */}
        <ellipse cx="28" cy="39" rx="10" ry="4.5" fill={mono ? '#333' : 'url(#hillGrad)'} opacity="0.55" />
        <path d="M18 39 Q28 34 38 39" fill="none" stroke={mono ? '#333' : 'url(#hillGrad)'} strokeWidth="1.5" opacity="0.75" />
      </g>

      {/* "MA" text — continues after icon */}
      <text
        x="212"
        y="60"
        fontFamily="'Arial Black', 'Impact', sans-serif"
        fontWeight="900"
        fontSize="58"
        letterSpacing="-1"
        fill={textColor}
      >
        MA
      </text>

      {/* FARM sub-line (full variant only) */}
      {!compact && (
        <g transform="translate(0, 70)">
          {/* Left rule line */}
          <line x1="30" y1="18" x2="118" y2="18" stroke={subColor} strokeWidth="1.2" opacity={ruleOpacity} />
          {/* Left leaf accent */}
          <path
            d="M110 14 C107 12 104 14 106 17 C107 15 109 14 110 14 Z"
            fill={subColor}
            opacity={ruleOpacity}
          />
          {/* FARM text */}
          <text
            x="170"
            y="23"
            fontFamily="'Arial', sans-serif"
            fontWeight="700"
            fontSize="16"
            letterSpacing="6"
            textAnchor="middle"
            fill={subColor}
          >
            FARM
          </text>
          {/* Right leaf accent */}
          <path
            d="M230 14 C233 12 236 14 234 17 C233 15 231 14 230 14 Z"
            fill={subColor}
            opacity={ruleOpacity}
          />
          {/* Right rule line */}
          <line x1="222" y1="18" x2="310" y2="18" stroke={subColor} strokeWidth="1.2" opacity={ruleOpacity} />
        </g>
      )}
    </svg>
  );
};

/* ─── Main export ────────────────────────────────────────────────── */
const RipomaLogo = ({
  variant  = 'full',
  color    = 'color',
  height   = 40,
  className = '',
  style    = {},
}) => {
  // Aspect ratios: full≈340/110≈3.09, compact≈340/80≈4.25, icon≈1
  const aspectRatios = { full: 340 / 110, compact: 340 / 80, icon: 1 };
  const ar = aspectRatios[variant] ?? aspectRatios.full;
  const width = Math.round(height * ar);

  const svgProps = {
    style: { height, width, display: 'inline-block', ...style },
    className,
  };

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...svgProps}
      >
        <LeafIcon mono={color === 'mono'} />
      </svg>
    );
  }

  const mono    = color === 'mono';
  const isWhite = color === 'white';
  const textColor = isWhite ? '#FFFFFF' : mono ? '#000000' : '#111111';
  const subColor  = isWhite ? '#FFFFFF' : mono ? '#000000' : '#1B5E20';
  const compact   = variant === 'compact';
  const H = compact ? 80 : 110;
  const ruleOpacity = isWhite ? 0.7 : 1;

  return (
    <svg
      viewBox={`0 0 340 ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      {!mono && (
        <defs>
          <linearGradient id={`leafG-${variant}-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#5FAE3E" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id={`hillG-${variant}-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3A8A2B" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
        </defs>
      )}

      {/* RIP */}
      <text
        x="10" y="60"
        fontFamily="'Arial Black', 'Impact', 'Oswald', sans-serif"
        fontWeight="900"
        fontSize="58"
        letterSpacing="-1"
        fill={textColor}
      >RIP</text>

      {/* Leaf circle icon */}
      <g transform="translate(152, 4)">
        <circle cx="28" cy="28" r="24" fill="none"
          stroke={mono ? '#000' : '#1B5E20'} strokeWidth="2.5" />
        <path d="M28 10 C26 17 21 24 22 33 C25 30 27 27 28 24 C29 27 31 30 34 33 C35 24 30 17 28 10 Z"
          fill={mono ? '#000' : `url(#leafG-${variant}-${color})`} />
        <path d="M21 16 C15 20 12 27 15 34 C18 29 20 25 23 23 C22 20 21.5 18 21 16 Z"
          fill={mono ? '#000' : `url(#leafG-${variant}-${color})`} opacity="0.85" />
        <path d="M35 16 C41 20 44 27 41 34 C38 29 36 25 33 23 C34 20 34.5 18 35 16 Z"
          fill={mono ? '#000' : `url(#leafG-${variant}-${color})`} opacity="0.85" />
        <ellipse cx="28" cy="39" rx="10" ry="4.5"
          fill={mono ? '#333' : `url(#hillG-${variant}-${color})`} opacity="0.55" />
        <path d="M18 39 Q28 34 38 39" fill="none"
          stroke={mono ? '#333' : '#2E7D32'} strokeWidth="1.5" opacity="0.75" />
      </g>

      {/* MA */}
      <text
        x="212" y="60"
        fontFamily="'Arial Black', 'Impact', 'Oswald', sans-serif"
        fontWeight="900"
        fontSize="58"
        letterSpacing="-1"
        fill={textColor}
      >MA</text>

      {/* FARM sub-line — full only */}
      {!compact && (
        <g transform="translate(0, 70)">
          <line x1="30" y1="18" x2="112" y2="18"
            stroke={subColor} strokeWidth="1.2" opacity={ruleOpacity} />
          <path d="M106 13 C103 11 100 13 102 17 C103.5 15 105 13.5 106 13 Z"
            fill={subColor} opacity={ruleOpacity} />
          <text x="170" y="23"
            fontFamily="'Arial', sans-serif"
            fontWeight="700" fontSize="16" letterSpacing="6"
            textAnchor="middle" fill={subColor}
          >FARM</text>
          <path d="M234 13 C237 11 240 13 238 17 C236.5 15 235 13.5 234 13 Z"
            fill={subColor} opacity={ruleOpacity} />
          <line x1="228" y1="18" x2="310" y2="18"
            stroke={subColor} strokeWidth="1.2" opacity={ruleOpacity} />
        </g>
      )}
    </svg>
  );
};

export default RipomaLogo;

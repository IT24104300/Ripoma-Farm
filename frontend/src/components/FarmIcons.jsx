import React from 'react';

/**
 * Hand-drawn icon set — loose, slightly imperfect strokes,
 * like sketches from a farmer's notebook.
 */

/* Wave / Water / Fish habitat */
export const WaveIcon = ({ className = "w-6 h-6", strokeWidth = 1.6 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 14c1.5-2 3-3 5-3 2.1 0 3.2 1.5 5 2 1.8.5 3.2-.5 5-2" />
    <path d="M2 10c1.4-1.8 3-2.8 5-2.8 2 0 3.3 1.3 5 2 1.7.6 3.2-.4 5-1.8" strokeOpacity="0.5" />
    <path d="M2 18c1.4-1.6 3-2.5 5-2.5 2 0 3.3 1.2 5 1.8 1.8.6 3.2-.4 5-1.8" strokeOpacity="0.3" />
  </svg>
);

/* Hen / Chicken — sketchy, imperfect */
export const HenIcon = ({ className = "w-6 h-6", strokeWidth = 1.6 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {/* Body */}
    <path d="M4 13.5c-.2-3.5 2.5-5.5 5.5-5.5 3 0 6.5 2 6.5 5.5 0 2.8-1.5 4.5-4.5 5h-3c-2.8-.4-4.3-2.2-4.5-5z" />
    {/* Wattle / comb */}
    <path d="M14 8c.5-1.5 2-2.5 3-2 1 .5.5 2-.5 2.5" />
    {/* Beak */}
    <path d="M16 11l2 1" />
    {/* Tail feathers */}
    <path d="M4 12 C2 11 1.5 9.5 2.5 8.5" />
    <path d="M4 14 C2.5 13.5 2 12 3 11" />
    {/* Legs */}
    <path d="M9 18.5l-1 3" />
    <path d="M13 18.5l1 3" />
    {/* Eye */}
    <circle cx="14.5" cy="11" r="0.6" fill="currentColor" />
  </svg>
);

/* Fishing net — hand-drawn grid */
export const FishingNetIcon = ({ className = "w-6 h-6", strokeWidth = 1.5 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5 C7 4 17 4 20 5 L21 19 C18 20 6 20 3 19 Z" />
    <path d="M8 5 L7 19" strokeOpacity="0.5" />
    <path d="M12 5 L12 19" strokeOpacity="0.5" />
    <path d="M16 5 L17 19" strokeOpacity="0.5" />
    <path d="M4 10 L20 10" strokeOpacity="0.4" />
    <path d="M4 15 L20 15" strokeOpacity="0.4" />
    <path d="M6 2.5 L12 5 L18 2.5" />
  </svg>
);

/* Feather — loose sketchy stroke */
export const FeatherIcon = ({ className = "w-6 h-6", strokeWidth = 1.5 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 4 C20 4 14 6 10 12 L6 21" />
    <path d="M6 21 C9 19 13 17 15 12" />
    <path d="M10 12 C8 14 7 16 6 21" />
    <path d="M12 9 L8 15" strokeOpacity="0.4" />
    <path d="M15 7 L10 14" strokeOpacity="0.3" />
    <path d="M18 5 L13 12" strokeOpacity="0.2" />
  </svg>
);

/* Sun over farm field */
export const SunFieldIcon = ({ className = "w-6 h-6", strokeWidth = 1.5 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M12 2.5 L12 4" />
    <path d="M7 4.5 L8 5.5" />
    <path d="M3.5 8 L5 8" />
    <path d="M7 11.5 L8 10.5" />
    <path d="M17 4.5 L16 5.5" />
    <path d="M20.5 8 L19 8" />
    <path d="M17 11.5 L16 10.5" />
    <path d="M3 16 C6 14.5 9 15.5 12 14.5 C15 13.5 18 15 21 14" />
    <path d="M3 19.5 C6 18 9.5 19 12 18 C14.5 17 18 18 21 17" />
  </svg>
);

/* Woven basket — hand-sketch style */
export const BasketIcon = ({ className = "w-6 h-6", strokeWidth = 1.5 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 11 C4.5 15 5 19.5 6 21 L18 21 C19 19.5 19.5 15 19 11 Z" />
    <path d="M3.5 11 L20.5 11" />
    {/* Weave horizontal strokes */}
    <path d="M6 14 C9 13 15 15 18 14" strokeOpacity="0.5" />
    <path d="M6 17 C9 16 15 18 18 17" strokeOpacity="0.4" />
    {/* Handle */}
    <path d="M9 11 C9 8 10 6.5 12 6.5 C14 6.5 15 8 15 11" />
  </svg>
);

/* Wooden delivery crate */
export const CrateIcon = ({ className = "w-6 h-6", strokeWidth = 1.5 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="13" rx="0.5" />
    <path d="M3 8 L5.5 3 L18.5 3 L21 8" />
    <path d="M8 3.5 L8 8" />
    <path d="M16 3.5 L16 8" />
    <path d="M3 13.5 L21 13.5" strokeOpacity="0.35" strokeDasharray="3 2.5" />
    <path d="M3 17 L21 17" strokeOpacity="0.25" strokeDasharray="3 2.5" />
    <path d="M9 11 L15 11" />
  </svg>
);

/* QR Traceability icon */
export const QRTraceIcon = ({ className = "w-6 h-6", strokeWidth = 1.5 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <path d="M14 14 L17 14 L17 17 L14 17 Z" />
    <path d="M20 14 L21 14 L21 17" />
    <path d="M17 20 L21 20 L21 21" />
    <path d="M12 7 L13 7" />
    <path d="M12 12 L12 14" />
    <path d="M7 12 L7 13" />
  </svg>
);

/* Egg — oval shape, hand-drawn */
export const EggIcon = ({ className = "w-6 h-6", strokeWidth = 1.6 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 C16.5 3 20 8 20 13.5 C20 18.5 16.5 21 12 21 C7.5 21 4 18.5 4 13.5 C4 8 7.5 3 12 3 Z" />
  </svg>
);

/* Leaf icon */
export const LeafIcon = ({ className = "w-6 h-6", strokeWidth = 1.6 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 20 C7 16 10 10 20 4 C20 4 20 12 15 16 C11 19 8 20 6 20 Z" />
    <path d="M6 20 L13 12" strokeOpacity="0.5" />
  </svg>
);

/* Stamp/Seal badge using terracotta clay style */
export const ClayStampBadge = ({ className = "w-24 h-24", text = "CLAY STAMPED" }) => (
  <div className={`relative flex items-center justify-center select-none cursor-default ${className}`}>
    <svg className="absolute inset-0 w-full h-full text-[#D9C4A3] animate-float" viewBox="0 0 100 100" fill="currentColor">
      <polygon points="50,4 79,13 96,38 96,68 79,93 50,98 21,93 4,68 4,38 21,13" />
    </svg>
    <svg className="absolute w-[82%] h-[82%] text-[#8A6A4B]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="50,9 75,18 90,40 90,66 75,87 50,91 25,87 10,66 10,40 25,18" strokeWidth="1.25" />
      <circle cx="50" cy="50" r="26" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="50" cy="50" r="10" strokeWidth="1" />
      <circle cx="50" cy="50" r="4.5" fill="currentColor" />
    </svg>
    <div className="absolute text-[7.5px] font-black text-[#5C4630] tracking-widest uppercase font-handwritten text-center leading-tight select-none max-w-[55px] mt-8">
      {text}
    </div>
  </div>
);

export const WaxSealBadge = ClayStampBadge;

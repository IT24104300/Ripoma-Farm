import React from 'react';

// Batik-inspired angular wave icon
export const WaveIcon = ({ className = "w-6 h-6", strokeWidth = 1.75 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 13l4-3.5h4l4 3.5h4l4-3.5" />
    <path d="M2 17.5l4-3.5h4l4 3.5h4l4-3.5" strokeOpacity="0.6" />
    <path d="M2 8.5l4-3.5h4l4 3.5h4l4-3.5" strokeOpacity="0.4" />
  </svg>
);

// Batik-inspired angular hen icon
export const HenIcon = ({ className = "w-6 h-6", strokeWidth = 1.75 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 13l4-4h6l4 3v5l-3 3H7l-4-3v-4z" />
    <path d="M14 9l2-3 2.5 1.5-1.5 2.5h-3z" />
    <path d="M10 9l2.5-2.5h2" />
    <path d="M14 17l-1.5 3.5h-1" />
    <path d="M9 17l-1.5 3.5h-1" />
    <path d="M6 12.5h3" />
  </svg>
);

// Batik-inspired angular fishing net icon
export const FishingNetIcon = ({ className = "w-6 h-6", strokeWidth = 1.75 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M2 12h20" />
    <path d="M3 6h18v12H3z" />
    <path d="M7 2v20M17 2v20" />
    <path d="M2 7.5l20 9M2 16.5l20-9" />
  </svg>
);

// Batik-inspired angular feather icon
export const FeatherIcon = ({ className = "w-6 h-6", strokeWidth = 1.75 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 3L11 13v8h8L21 11V3z" />
    <path d="M3 21l9-9" />
    <path d="M8 14H4v4" />
    <path d="M14 8h4v4" />
  </svg>
);

// Batik-inspired angular sun over field icon
export const SunFieldIcon = ({ className = "w-6 h-6", strokeWidth = 1.75 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {/* Sun */}
    <rect x="10" y="5" width="4" height="4" />
    <path d="M12 2v1M7 4l1 1M3 7h1M17 4l-1 1M21 7h-1" />
    {/* Fields */}
    <path d="M2 15l6-3.5h8l6 3.5" />
    <path d="M2 19l8-4.5h6l6 4.5" />
    <path d="M7 15l-1 5" />
    <path d="M14 16.5l-2 3.5" />
  </svg>
);

// Batik-inspired angular woven basket icon
export const BasketIcon = ({ className = "w-6 h-6", strokeWidth = 1.75 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h16l-2 10H6L4 10z" />
    <path d="M5 10c0-4 3-6 7-6s7 2 7 6" />
    <path d="M8 10v10M12 10v10M16 10v10" strokeOpacity="0.4" />
    <path d="M5 15h14" strokeOpacity="0.3" />
  </svg>
);

// Batik-inspired angular delivery crate
export const CrateIcon = ({ className = "w-6 h-6", strokeWidth = 1.75 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18v12H3z" />
    <path d="M3 6l4-3.5h10l4 3.5" />
    <path d="M7 2.5v3.5M17 2.5v3.5" />
    <path d="M3 12h18M3 15h18" strokeOpacity="0.3" strokeDasharray="2 2" />
    <path d="M8 9h8" />
  </svg>
);

// QR/traceability icon
export const QRTraceIcon = ({ className = "w-6 h-6", strokeWidth = 1.75 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3z" />
    <path d="M15 15h2v2h-2zM19 19h2v2h-2zM15 19h2v2h-2z" />
    <path d="M19 15h2v2h-2z" />
    <path d="M12 6h1M12 12h1M6 12h1M12 18h1" />
  </svg>
);

// Concentric Terracotta Clay Stamp Badge (replacing wax seal)
export const ClayStampBadge = ({ className = "w-24 h-24", text = "CLAY STAMPED" }) => (
  <div className={`relative flex items-center justify-center select-none cursor-default ${className}`}>
    {/* Decagon shaped stamped terracotta clay base */}
    <svg className="absolute inset-0 w-full h-full text-farm-gold/25 animate-float" viewBox="0 0 100 100" fill="currentColor">
      <polygon points="50,4 79,13 96,38 96,68 79,93 50,98 21,93 4,68 4,38 21,13" />
    </svg>
    <svg className="absolute w-[82%] h-[82%] text-farm-gold" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Inner pressed clay ring */}
      <polygon points="50,9 75,18 90,40 90,66 75,87 50,91 25,87 10,66 10,40 25,18" strokeWidth="1.25" />
      <circle cx="50" cy="50" r="26" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Concentric rings mimicking ancient Sri Lankan clay stamp seals */}
      <circle cx="50" cy="50" r="10" strokeWidth="1" />
      <circle cx="50" cy="50" r="4.5" fill="currentColor" />
    </svg>
    <div className="absolute text-[7.5px] font-black text-farm-earth tracking-widest uppercase font-serif text-center leading-tight select-none max-w-[55px] mt-8.5">
      {text}
    </div>
  </div>
);

// Maintain alias export for backward compatibility and zero compile warnings
export const WaxSealBadge = ClayStampBadge;

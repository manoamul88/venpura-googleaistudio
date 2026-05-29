import React from 'react';

interface TeamLogoProps {
  customUrl?: string | null;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function TeamLogo({ customUrl, className = '', size = 'md' }: TeamLogoProps) {
  // Determine pixel size based on token
  const sizeMap = {
    xs: 'w-8 h-8',       // header mini badge
    sm: 'w-12 h-12',     // player/match list item
    md: 'w-20 h-20',     // dashboard header
    lg: 'w-32 h-32',     // larger badge
    xl: 'w-44 h-44',     // login screen large showcase
  };

  const selectedSize = sizeMap[size];

  if (customUrl) {
    return (
      <div className={`relative rounded-full overflow-hidden border-2 border-amber-500 shadow-lg ${selectedSize} ${className}`}>
        <img
          src={customUrl}
          alt="Venpura CC Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Draw the exact custom SVG of the Venpura Emblem (Dove, crossed bats, red cricket ball, navy-blue badge, gold trim, and gold banner at bottom with "VENPURA" lettering)
  return (
    <div className={`relative select-none shrink-0 ${selectedSize} ${className}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl filter"
      >
        {/* Outer navy base circle */}
        <circle cx="100" cy="100" r="94" fill="#0b172a" />
        
        {/* Gold double outer border */}
        <circle cx="100" cy="100" r="92" stroke="#d4af37" strokeWidth="4.5" />
        <circle cx="100" cy="100" r="82" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
        
        {/* Navy/Blue Shield Background */}
        <path
          d="M100 28 L142 55 V110 C142 142 119 160 100 168 C81 160 58 142 58 110 V55 Z"
          fill="#112543"
          stroke="#d4af37"
          strokeWidth="2.5"
        />

        {/* Inner glow circle */}
        <circle cx="100" cy="100" r="76" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.15" />

        {/* Circular Arrangement of Stars (around the ring) */}
        {Array.from({ length: 22 }).map((_, idx) => {
          // Arrange stars symmetrically in an outer arc
          const angle = (idx * (360 / 22)) * (Math.PI / 180);
          const r = 87;
          const x = 100 + r * Math.cos(angle);
          const y = 100 + r * Math.sin(angle);
          // Omit stars where the ribbon banner sits at bottom
          if (idx >= 3 && idx <= 8) return null; 
          return (
            <path
              key={idx}
              d="M100 10 L102.5 15 L108 15.5 L104 19 L105.5 24.5 L100 21.5 L94.5 24.5 L96 19 L92 15.5 L97.5 15 Z"
              fill="#ffffff"
              transform={`translate(${x - 100}, ${y - 10}) scale(0.4) translate(-100, -10)`}
            />
          );
        })}

        {/* Crossed Cricket Bats */}
        {/* Bat 1: Top-Left to Bottom-Right */}
        <g transform="translate(100, 110) rotate(-40)">
          {/* Handle */}
          <rect x="-2" y="-55" width="4" height="25" fill="#f8fafc" rx="1.5" stroke="#475569" strokeWidth="0.5" />
          {/* Grip wrap lines */}
          <line x1="-2" y1="-50" x2="2" y2="-50" stroke="#1e293b" strokeWidth="0.5" />
          <line x1="-2" y1="-45" x2="2" y2="-45" stroke="#1e293b" strokeWidth="0.5" />
          <line x1="-2" y1="-40" x2="2" y2="-40" stroke="#1e293b" strokeWidth="0.5" />
          {/* Shoulder/Wood Blade */}
          <path d="M-4.5 -30 C-4.5 -30 -4 -32 0 -32 C4 -32 4.5 -30 4.5 -30 L4.5 10 C4.5 15 2 17 0 17 C-2 17 -4.5 15 -4.5 10 Z" fill="#d2b48c" stroke="#5c4033" strokeWidth="1" />
          <line x1="0" y1="-30" x2="0" y2="10" stroke="#8b5a2b" strokeWidth="0.5" opacity="0.4" />
        </g>

        {/* Bat 2: Top-Right to Bottom-Left */}
        <g transform="translate(100, 110) rotate(40)">
          {/* Handle */}
          <rect x="-2" y="-55" width="4" height="25" fill="#f8fafc" rx="1.5" stroke="#475569" strokeWidth="0.5" />
          {/* Grip wrap lines */}
          <line x1="-2" y1="-50" x2="2" y2="-50" stroke="#1e293b" strokeWidth="0.5" />
          <line x1="-2" y1="-45" x2="2" y2="-45" stroke="#1e293b" strokeWidth="0.5" />
          <line x1="-2" y1="-40" x2="2" y2="-40" stroke="#1e293b" strokeWidth="0.5" />
          {/* Shoulder/Wood Blade */}
          <path d="M-4.5 -30 C-4.5 -30 -4 -32 0 -32 C4 -32 4.5 -30 4.5 -30 L4.5 10 C4.5 15 2 17 0 17 C-2 17 -4.5 15 -4.5 10 Z" fill="#d2b48c" stroke="#5c4033" strokeWidth="1" />
          <line x1="0" y1="-30" x2="0" y2="10" stroke="#8b5a2b" strokeWidth="0.5" opacity="0.4" />
        </g>

        {/* Red Cricket Ball at bottom crossroads */}
        <circle cx="100" cy="132" r="13" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1" />
        {/* Ball Seam */}
        <path d="M100 119 C98 123 98 141 100 145" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
        <path d="M100 119 C102 123 102 141 100 145" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.5" />
        {/* Gloss highlight */}
        <circle cx="96" cy="128" r="4" fill="#ffffff" opacity="0.25" />

        {/* Beautiful peace dove (White Flying Bird in center) */}
        <g transform="translate(100, 72) scale(1.15)">
          {/* Left Wing (expanded upwards) */}
          <path 
            d="M -3 0 C -12 -12, -26 -30, -22 -38 C -18 -42, -5 -32, 0 -14" 
            fill="#ffffff" 
            stroke="#1e293b" 
            strokeWidth="0.75" 
          />
          <path 
            d="M -5 -8 C -11 -18, -19 -28, -17 -31 C -15 -33, -7 -25, -2 -14" 
            fill="#f1f5f9" 
          />
          
          {/* Right Wing (expanded upwards) */}
          <path 
            d="M 3 0 C 12 -12, 26 -30, 22 -38 C 18 -42, 5 -32, 0 -14" 
            fill="#ffffff" 
            stroke="#1e293b" 
            strokeWidth="0.75" 
          />
          <path 
            d="M 5 -8 C 11 -18, 19 -28, 17 -31 C 15 -33, 7 -25, 2 -14" 
            fill="#f1f5f9" 
          />

          {/* Tail feathers */}
          <path 
            d="M -4 4 C -6 18, -10 21, -8 24 C -6 25, 6 25, 8 24 C 10 21, 6 18, 4 4 Z" 
            fill="#f8fafc" 
            stroke="#1e293b" 
            strokeWidth="0.75" 
          />

          {/* Body */}
          <path 
            d="M -5 -4 C -7 -6, -9 -14, 0 -16 C 9 -14, 7 -6, 5 -4 C 4 2, 2 8, 0 10 C -2 8, -4 2, -5 -4 Z" 
            fill="#ffffff" 
            stroke="#1e293b" 
            strokeWidth="0.75" 
          />
          
          {/* Dove Head */}
          <circle cx="0" cy="-19" r="4.5" fill="#ffffff" stroke="#1e293b" strokeWidth="0.75" />
          
          {/* Beak (Gold/Amber) */}
          <path d="M 4 -19.5 L 8.5 -18 L 4 -16.5 Z" fill="#f59e0b" />
          
          {/* Eye */}
          <circle cx="1.5" cy="-20" r="0.6" fill="#1e293b" />
        </g>

        {/* Elegant curved ribbon banner at bottom */}
        {/* Ribbon back folds */}
        <path d="M22 158 L12 142 L25 138 Z" fill="#0f172a" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M178 158 L188 142 L175 138 Z" fill="#0f172a" stroke="#d4af37" strokeWidth="1.5" />
        
        {/* Curved ribbon main plate */}
        <path
          d="M 22 138 C 45 156, 155 156, 178 138 L 170 170 C 145 186, 55 186, 30 170 Z"
          fill="#0c1d33"
          stroke="#d4af37"
          strokeWidth="3"
        />

        {/* Text "VENPURA" in golden banner */}
        <defs>
          <path
            id="textPath-banner"
            d="M 33 162 C 60 173, 140 173, 167 162"
          />
        </defs>
        <text className="font-sans font-black select-none tracking-widest fill-white filter drop-shadow">
          <textPath
            href="#textPath-banner"
            startOffset="50%"
            textAnchor="middle"
            fontSize="18px"
            fontWeight="900"
            letterSpacing="2.5"
          >
            VENPURA
          </textPath>
        </text>
      </svg>
    </div>
  );
}

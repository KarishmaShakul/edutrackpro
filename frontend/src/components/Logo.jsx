import React from 'react';

const LogoIconSVG = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Base background - dark navy */}
    <rect width="100" height="100" rx="20" fill="#0A0F1F" />

    {/* White Text Paths representing stylized 'ETP' cut by the trend line */}
    <g fill="#ffffff">
      {/* E */}
      <path d="M 22 40 h 14 v 5 h -9 v 4 h 8 v 5 h -8 v 4 h 9 v 5 h -14 z" />
      {/* T */}
      <path d="M 38 40 h 17 v 5 h -6 v 18 h -5 v -18 h -6 z" />
      {/* Third symbol cut by graph (looks like left half of P) */}
      <path d="M 57 40 h 9 l 4 4 v 6 l -4 4 h -4 v 9 h -5 z" />
    </g>

    {/* The Green filled area (Graph Mountain) under the text */}
    <polygon points="22,75 42,55 52,65 77,40 77,75" fill="#2CD493" />

    {/* Dark Halo Mask overlay to create the visual gap through the text and mountain */}
    <line x1="45" y1="73" x2="85" y2="33" stroke="#0A0F1F" strokeWidth="11" strokeLinecap="square" />

    {/* The Green Arrow Line matching the graph slope */}
    <line x1="48" y1="70" x2="80" y2="38" stroke="#2CD493" strokeWidth="5.5" strokeLinecap="square" />

    {/* The Green Arrow Head pointing to top-right */}
    <polygon points="68,36 82,36 82,50" fill="#2CD493" />
  </svg>
);

const Logo = ({ type = 'full', className = '' }) => {
  if (type === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <LogoIconSVG className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex-shrink-0 h-full flex items-center">
        <LogoIconSVG className="h-full w-auto aspect-square text-white" />
      </div>
      <div className="flex items-baseline mb-[3%]">
        <span className="font-bold tracking-tight text-white font-['Outfit',system-ui,sans-serif]" style={{ fontSize: '1.25em' }}>EduTrack</span>
        <span className="font-bold tracking-tight text-[#2CD493] font-['Outfit',system-ui,sans-serif]" style={{ fontSize: '1.25em' }}>Pro</span>
      </div>
    </div>
  );
};

export default Logo;

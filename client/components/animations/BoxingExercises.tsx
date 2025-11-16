import React from "react";

// Jab - Beginner
export const Jab = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes jabPunch {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(25px); }
        }
        .jabber { animation: jabPunch 1.8s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="80" cy="70" r="12" fill="#E8D4C0" />

    {/* Body */}
    <rect x="70" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Stance legs */}
    <line x1="72" y1="120" x2="68" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="88" y1="120" x2="92" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Back arm (guard) */}
    <line x1="70" y1="95" x2="55" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Jabbing arm - animated */}
    <g className="jabber">
      <line x1="90" y1="95" x2="130" y2="90" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="135" cy="88" r="5" fill="#E8D4C0" />
    </g>

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Cross - Beginner
export const Cross = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes crossPunch {
          0%, 100% { transform: translateX(0) rotateZ(0deg); }
          50% { transform: translateX(30px) rotateZ(15deg); }
        }
        .crosser { animation: crossPunch 2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="75" cy="70" r="12" fill="#E8D4C0" />

    {/* Body */}
    <rect x="65" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Stance legs */}
    <line x1="67" y1="120" x2="63" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="83" y1="120" x2="87" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Front arm (guard) */}
    <line x1="85" y1="95" x2="100" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Crossing arm - animated */}
    <g className="crosser">
      <line x1="65" y1="95" x2="120" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="125" cy="82" r="5" fill="#E8D4C0" />
    </g>

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Jab-Cross Combo - Beginner
export const JabCrossCombo = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes jabCross {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(20px); }
          75% { transform: translateX(35px) rotateZ(10deg); }
        }
        .comboHands { animation: jabCross 2.4s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head in guard */}
    <circle cx="70" cy="70" r="12" fill="#E8D4C0" />

    {/* Body */}
    <rect x="60" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Stance legs */}
    <line x1="62" y1="120" x2="58" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="78" y1="120" x2="82" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Guard hand */}
    <line x1="80" y1="95" x2="100" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Combo punches - animated */}
    <g className="comboHands">
      <line x1="60" y1="95" x2="125" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="130" cy="82" r="5" fill="#E8D4C0" />
    </g>

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Basic Footwork - Beginner
export const BasicFootwork = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes stepLeft {
          0%, 100% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
        }
        .steppers { animation: stepLeft 2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="70" r="12" fill="#E8D4C0" />

    {/* Body in guard */}
    <rect x="90" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Guard hands */}
    <line x1="90" y1="95" x2="70" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    <line x1="110" y1="95" x2="130" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Footwork - stepping */}
    <g className="steppers">
      <line x1="92" y1="120" x2="88" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="120" x2="112" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Hooks - Intermediate
export const Hooks = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes hookPunch {
          0%, 100% { transform: rotateZ(0deg); }
          50% { transform: rotateZ(45deg); }
        }
        .hooker { animation: hookPunch 2.1s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="75" cy="70" r="12" fill="#E8D4C0" />

    {/* Body */}
    <rect x="65" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Stance legs */}
    <line x1="67" y1="120" x2="63" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="83" y1="120" x2="87" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Guard hand */}
    <line x1="85" y1="95" x2="105" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Hook arm - animated */}
    <g className="hooker">
      <line x1="65" y1="98" x2="105" y2="95" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="110" cy="93" r="5" fill="#E8D4C0" />
    </g>

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Uppercuts - Intermediate
export const Uppercuts = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes uppercut {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        .upper { animation: uppercut 2.2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="80" cy="70" r="12" fill="#E8D4C0" />

    {/* Body */}
    <rect x="70" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Stance legs */}
    <line x1="72" y1="120" x2="68" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="88" y1="120" x2="92" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Guard hand */}
    <line x1="70" y1="95" x2="55" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Uppercut arm - animated */}
    <g className="upper">
      <line x1="90" y1="120" x2="95" y2="75" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="97" cy="70" r="5" fill="#E8D4C0" />
    </g>

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Slips - Intermediate
export const Slips = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes slipMove {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-15px); }
        }
        .slipper { animation: slipMove 2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head - moving to slip */}
    <g className="slipper">
      <circle cx="80" cy="70" r="12" fill="#E8D4C0" />
    </g>

    {/* Body */}
    <rect x="70" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Guard hands */}
    <line x1="70" y1="95" x2="55" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    <line x1="90" y1="95" x2="105" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Stance legs */}
    <line x1="72" y1="120" x2="68" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="88" y1="120" x2="92" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Pivots - Intermediate
export const Pivots = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes pivotRotate {
          0%, 100% { transform: rotateZ(0deg); transform-origin: 100px 90px; }
          50% { transform: rotateZ(30deg); transform-origin: 100px 90px; }
        }
        .pivotter { animation: pivotRotate 2.2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Body rotating - Pivot */}
    <g className="pivotter">
      {/* Head */}
      <circle cx="100" cy="70" r="12" fill="#E8D4C0" />

      {/* Body */}
      <rect x="90" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

      {/* Guard hands */}
      <line x1="90" y1="95" x2="70" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="95" x2="130" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Base leg */}
    <line x1="100" y1="120" x2="100" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Back leg pivoting */}
    <line x1="96" y1="120" x2="85" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Jab-Cross-Hook Combo - Intermediate
export const JabCrossHookCombo = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes comboSequence {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(20px); }
          50% { transform: translateX(35px) rotateZ(8deg); }
          75% { transform: translateX(15px) rotateZ(-15deg); }
        }
        .comboArm { animation: comboSequence 2.8s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="70" cy="70" r="12" fill="#E8D4C0" />

    {/* Body */}
    <rect x="60" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Guard hand */}
    <line x1="80" y1="95" x2="100" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Combo arm - animated */}
    <g className="comboArm">
      <line x1="60" y1="95" x2="130" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="135" cy="82" r="5" fill="#E8D4C0" />
    </g>

    {/* Stance legs */}
    <line x1="62" y1="120" x2="58" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="78" y1="120" x2="82" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Complex Combos (1-2-3-2) - Advanced
export const ComplexCombos = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes complexCombo {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(15px); }
          30% { transform: translateX(30px) rotateZ(8deg); }
          45% { transform: translateX(20px) rotateZ(-12deg); }
          60% { transform: translateX(35px); }
          75% { transform: translateX(25px) rotateZ(-8deg); }
        }
        .complexArm { animation: complexCombo 3.2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head in guard */}
    <circle cx="65" cy="70" r="12" fill="#E8D4C0" />

    {/* Body in aggressive stance */}
    <rect x="55" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Guard hand */}
    <line x1="75" y1="95" x2="95" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Complex combo arm - rapid animation */}
    <g className="complexArm">
      <line x1="55" y1="95" x2="135" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="140" cy="82" r="5" fill="#E8D4C0" />
    </g>

    {/* Wide stance legs */}
    <line x1="57" y1="120" x2="50" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="73" y1="120" x2="80" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Roll-Slip Counter - Advanced
export const RollSlipCounter = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes rollSlip {
          0%, 100% { transform: rotateZ(-15deg) translateX(0); transform-origin: 80px 85px; }
          50% { transform: rotateZ(0deg) translateX(-10px); transform-origin: 80px 85px; }
        }
        @keyframes counterPunch {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(30px); }
        }
        .roller { animation: rollSlip 2.4s ease-in-out infinite; }
        .counter { animation: counterPunch 2.4s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Rolling/Slipping body */}
    <g className="roller">
      {/* Head */}
      <circle cx="80" cy="70" r="12" fill="#E8D4C0" />

      {/* Body */}
      <rect x="70" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

      {/* Guard hand */}
      <line x1="70" y1="95" x2="55" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Counter punch arm */}
    <g className="counter">
      <line x1="90" y1="95" x2="140" y2="90" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="145" cy="88" r="5" fill="#E8D4C0" />
    </g>

    {/* Stance legs */}
    <line x1="72" y1="120" x2="68" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="88" y1="120" x2="92" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Fast Shadowboxing - Advanced
export const FastShadowboxing = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes fastJab {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(25px); }
        }
        @keyframes fastCross {
          0%, 100% { transform: translateX(0) rotateZ(0deg); }
          50% { transform: translateX(30px) rotateZ(12deg); }
        }
        .fastJabber { animation: fastJab 1.4s ease-in-out infinite; }
        .fastCrosser { animation: fastCross 1.6s ease-in-out infinite 0.2s; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="75" cy="70" r="12" fill="#E8D4C0" />

    {/* Body */}
    <rect x="65" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Fast jab */}
    <g className="fastJabber">
      <line x1="85" y1="95" x2="130" y2="90" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="135" cy="88" r="4" fill="#E8D4C0" />
    </g>

    {/* Fast cross */}
    <g className="fastCrosser">
      <line x1="65" y1="98" x2="125" y2="88" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <circle cx="130" cy="85" r="4" fill="#E8D4C0" />
    </g>

    {/* Stance legs */}
    <line x1="67" y1="120" x2="63" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="83" y1="120" x2="87" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Power Combinations - Advanced
export const PowerCombinations = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes powerCombo {
          0%, 100% { transform: translateX(0) rotateZ(0deg); }
          25% { transform: translateX(20px) rotateZ(0deg); }
          50% { transform: translateX(40px) rotateZ(18deg); }
          75% { transform: translateX(25px) rotateZ(-20deg); }
        }
        .powerArm { animation: powerCombo 2.6s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head in aggressive guard */}
    <circle cx="60" cy="70" r="12" fill="#E8D4C0" />

    {/* Body in power stance */}
    <rect x="50" y="85" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Guard hand */}
    <line x1="70" y1="95" x2="90" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Power punching arm - animated */}
    <g className="powerArm">
      <line x1="50" y1="95" x2="140" y2="85" stroke="#E8D4C0" strokeWidth="5" strokeLinecap="round" />
      <circle cx="145" cy="82" r="6" fill="#E8D4C0" />
    </g>

    {/* Power stance - wide legs */}
    <line x1="52" y1="120" x2="42" y2="155" stroke="#1A1A1A" strokeWidth="6" strokeLinecap="round" />
    <line x1="68" y1="120" x2="78" y2="155" stroke="#1A1A1A" strokeWidth="6" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

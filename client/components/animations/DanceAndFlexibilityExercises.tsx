import React from "react";

// ===== ZUMBA =====

// Basic Salsa - Beginner
export const BasicSalsa = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes salsa {
          0%, 100% { transform: translateX(-10px) rotateZ(-5deg); }
          50% { transform: translateX(10px) rotateZ(5deg); }
        }
        .salsero { animation: salsa 1.8s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="60" r="12" fill="#E8D4C0" className="salsero" />

    {/* Body swaying */}
    <g className="salsero">
      <ellipse cx="100" cy="90" rx="12" ry="25" fill="#FF6B6B" />

      {/* Arms up in salsa pose */}
      <line x1="88" y1="85" x2="65" y2="55" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="112" y1="85" x2="135" y2="55" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Hips swaying */}
      <circle cx="98" cy="115" r="7" fill="#FF6B6B" />
    </g>

    {/* Legs grooving */}
    <line x1="96" y1="115" x2="92" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="salsero" />
    <line x1="104" y1="115" x2="108" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="salsero" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Merengue - Beginner
export const Merengue = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes merengue {
          0%, 100% { transform: translateY(0) rotateZ(0deg); }
          25% { transform: translateY(-8px) rotateZ(3deg); }
          50% { transform: translateY(0) rotateZ(0deg); }
          75% { transform: translateY(-8px) rotateZ(-3deg); }
        }
        .merenguero { animation: merengue 1.6s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head bouncing */}
    <circle cx="100" cy="60" r="12" fill="#E8D4C0" className="merenguero" />

    {/* Body */}
    <g className="merenguero">
      <ellipse cx="100" cy="90" rx="13" ry="26" fill="#FF6B6B" />

      {/* Arms in happy pose */}
      <line x1="87" y1="80" x2="60" y2="60" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="113" y1="80" x2="140" y2="60" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Bouncing legs */}
    <line x1="95" y1="116" x2="90" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="merenguero" />
    <line x1="105" y1="116" x2="110" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="merenguero" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Grapevine - Beginner
export const Grapevine = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes grapevine {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(15px); }
          50% { transform: translateX(-15px); }
          75% { transform: translateX(10px); }
        }
        .grapeviner { animation: grapevine 2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="65" r="11" fill="#E8D4C0" />

    {/* Body in dance position */}
    <g className="grapeviner">
      <ellipse cx="100" cy="92" rx="12" ry="24" fill="#FF6B6B" />

      {/* Arms out for balance */}
      <line x1="88" y1="85" x2="55" y2="70" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="112" y1="85" x2="145" y2="70" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Side stepping legs */}
    <line x1="94" y1="116" x2="85" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="grapeviner" />
    <line x1="106" y1="116" x2="115" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="grapeviner" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Side Steps - Beginner
export const SideSteps = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes sideStep {
          0%, 100% { transform: translateX(-12px); }
          50% { transform: translateX(12px); }
        }
        .stepper { animation: sideStep 1.8s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="65" r="11" fill="#E8D4C0" />

    {/* Body */}
    <g className="stepper">
      <ellipse cx="100" cy="92" rx="12" ry="24" fill="#FF6B6B" />

      {/* Arms in rhythm position */}
      <line x1="88" y1="82" x2="60" y2="70" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="112" y1="82" x2="140" y2="70" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Stepping legs */}
    <line x1="94" y1="116" x2="88" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="stepper" />
    <line x1="106" y1="116" x2="112" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="stepper" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Reggaeton Steps - Intermediate
export const Reggaeton = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes reggaeton {
          0%, 100% { transform: translateX(0) rotateZ(0deg); }
          25% { transform: translateX(12px) rotateZ(4deg); }
          50% { transform: translateX(-12px) rotateZ(-4deg); }
          75% { transform: translateX(8px) rotateZ(2deg); }
        }
        .reggaetoner { animation: reggaeton 1.6s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="62" r="12" fill="#E8D4C0" />

    {/* Body grooving */}
    <g className="reggaetoner">
      <ellipse cx="100" cy="90" rx="13" ry="25" fill="#FF6B6B" />

      {/* Arms in hip-hop style */}
      <line x1="87" y1="78" x2="55" y2="65" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="113" y1="78" x2="145" y2="65" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Hip accent */}
      <circle cx="98" cy="114" r="6" fill="#FF6B6B" />
    </g>

    {/* Hip rolling legs */}
    <line x1="96" y1="115" x2="90" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="reggaetoner" />
    <line x1="104" y1="115" x2="110" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="reggaetoner" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Hip Rolls - Intermediate
export const HipRolls = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes hipRoll {
          0%, 100% { transform: rotateZ(0deg); transform-origin: 100px 105px; }
          25% { transform: rotateZ(15deg); transform-origin: 100px 105px; }
          50% { transform: rotateZ(-15deg); transform-origin: 100px 105px; }
          75% { transform: rotateZ(10deg); transform-origin: 100px 105px; }
        }
        .hipRoller { animation: hipRoll 2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="60" r="12" fill="#E8D4C0" />

    {/* Body and hips rolling */}
    <g className="hipRoller">
      <ellipse cx="100" cy="88" rx="13" ry="24" fill="#FF6B6B" />

      {/* Arms in rhythm */}
      <line x1="87" y1="78" x2="55" y2="60" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="113" y1="78" x2="145" y2="60" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Hip circles */}
      <circle cx="100" cy="112" r="7" fill="#FF6B6B" />
    </g>

    {/* Grounded legs */}
    <line x1="94" y1="112" x2="90" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="106" y1="112" x2="110" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Faster Syncopated Moves - Intermediate
export const FastSyncopated = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes fastSynco {
          0%, 100% { transform: translateX(-10px) translateY(-5px); }
          33% { transform: translateX(10px) translateY(5px); }
          66% { transform: translateX(-8px) translateY(-8px); }
        }
        .syncoMover { animation: fastSynco 1.4s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="62" r="11" fill="#E8D4C0" className="syncoMover" />

    {/* Body fast moving */}
    <g className="syncoMover">
      <ellipse cx="100" cy="90" rx="12" ry="24" fill="#FF6B6B" />

      {/* Dynamic arms */}
      <line x1="88" y1="78" x2="50" y2="55" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="112" y1="78" x2="150" y2="55" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Fast stepping legs */}
    <line x1="94" y1="114" x2="88" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="syncoMover" />
    <line x1="106" y1="114" x2="112" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="syncoMover" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Full Choreography - Advanced
export const FullChoreography = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes choreography {
          0%, 100% { transform: translateX(-15px) rotateZ(-8deg); }
          25% { transform: translateX(15px) rotateZ(8deg); }
          50% { transform: translateX(-10px) rotateZ(-5deg); }
          75% { transform: translateX(12px) rotateZ(6deg); }
        }
        .dancer { animation: choreography 2.2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="58" r="12" fill="#E8D4C0" className="dancer" />

    {/* Body full choreography */}
    <g className="dancer">
      <ellipse cx="100" cy="88" rx="13" ry="26" fill="#FF6B6B" />

      {/* Dynamic arms */}
      <line x1="87" y1="75" x2="45" y2="50" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="113" y1="75" x2="155" y2="50" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Hip movement */}
      <circle cx="98" cy="114" r="7" fill="#FF6B6B" />
    </g>

    {/* Dynamic stepping */}
    <line x1="94" y1="114" x2="85" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="dancer" />
    <line x1="106" y1="114" x2="115" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" className="dancer" />

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// ===== YOGA =====

// Child's Pose - Beginner
export const ChildsPose = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes childPose {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .child { animation: childPose 3s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="20" y="140" width="160" height="8" fill="#D3D3D3" rx="2" />

    {/* Person in child's pose */}
    <g className="child">
      {/* Head on ground */}
      <circle cx="70" cy="125" r="10" fill="#E8D4C0" />

      {/* Back rounded */}
      <ellipse cx="75" cy="110" rx="15" ry="18" fill="#FF6B6B" />

      {/* Arms reaching forward */}
      <line x1="60" y1="100" x2="35" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="90" y1="100" x2="115" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs folded */}
      <line x1="65" y1="128" x2="60" y2="148" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="85" y1="128" x2="90" y2="148" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// Cat-Cow - Beginner
export const CatCow = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes catCow {
          0%, 100% { d: path("M 60 100 Q 100 85 140 100"); }
          50% { d: path("M 60 115 Q 100 95 140 115"); }
        }
        .spine { animation: catCow 2.4s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="20" y="140" width="160" height="8" fill="#D3D3D3" rx="2" />

    {/* Head */}
    <circle cx="140" cy="80" r="10" fill="#E8D4C0" />

    {/* Back arching/rounding */}
    <path d="M 60 110 Q 100 90 140 110" stroke="#FF6B6B" strokeWidth="12" fill="none" strokeLinecap="round" />

    {/* Arms on ground */}
    <line x1="65" y1="120" x2="55" y2="140" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    <line x1="135" y1="120" x2="145" y2="140" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Legs on ground */}
    <line x1="70" y1="120" x2="65" y2="148" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="130" y1="120" x2="135" y2="148" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

// Cobra Pose - Beginner
export const CobraPose = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes cobra {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .cobraman { animation: cobra 2.4s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="20" y="140" width="160" height="8" fill="#D3D3D3" rx="2" />

    {/* Person in cobra */}
    <g className="cobraman">
      {/* Head up */}
      <circle cx="100" cy="75" r="10" fill="#E8D4C0" />

      {/* Body arched upward */}
      <path d="M 100 85 Q 90 110 100 130" stroke="#FF6B6B" strokeWidth="12" fill="none" strokeLinecap="round" />

      {/* Arms supporting */}
      <line x1="90" y1="95" x2="70" y2="100" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="95" x2="130" y2="100" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs on ground */}
      <line x1="96" y1="130" x2="92" y2="148" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="104" y1="130" x2="108" y2="148" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// Downward Dog - Beginner
export const DownwardDog = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes downdog {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .dogger { animation: downdog 3s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="20" y="140" width="160" height="8" fill="#D3D3D3" rx="2" />

    {/* Person in downward dog */}
    <g className="dogger">
      {/* Head down */}
      <circle cx="100" cy="95" r="9" fill="#E8D4C0" />

      {/* Back body forming inverted V */}
      <line x1="100" y1="104" x2="100" y2="130" stroke="#FF6B6B" strokeWidth="11" strokeLinecap="round" />

      {/* Arms supporting (angled) */}
      <line x1="95" y1="105" x2="60" y2="120" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="105" y1="105" x2="140" y2="120" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs up (angled) */}
      <line x1="98" y1="130" x2="75" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="102" y1="130" x2="125" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// Warrior II - Intermediate
export const WarriorII = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes warrior {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .warrior { animation: warrior 3.2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="20" y="140" width="160" height="8" fill="#D3D3D3" rx="2" />

    {/* Person in warrior II */}
    <g className="warrior">
      {/* Head looking to side */}
      <circle cx="100" cy="65" r="11" fill="#E8D4C0" />

      {/* Body upright */}
      <rect x="92" y="78" width="16" height="32" fill="#FF6B6B" rx="2" />

      {/* Arms extended out to sides */}
      <line x1="92" y1="85" x2="45" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="108" y1="85" x2="155" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Front leg bent in lunge */}
      <line x1="96" y1="110" x2="88" y2="148" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="88" y1="148" x2="85" y2="158" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Back leg straight */}
      <line x1="104" y1="110" x2="118" y2="158" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// Bridge Pose - Intermediate
export const BridgePose = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes bridge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .bridger { animation: bridge 2.6s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="20" y="140" width="160" height="8" fill="#D3D3D3" rx="2" />

    {/* Person in bridge */}
    <g className="bridger">
      {/* Head on mat */}
      <circle cx="100" cy="125" r="10" fill="#E8D4C0" />

      {/* Body elevated bridge */}
      <path d="M 80 115 Q 100 95 120 115" stroke="#FF6B6B" strokeWidth="12" fill="none" strokeLinecap="round" />

      {/* Arms on ground supporting */}
      <line x1="85" y1="118" x2="65" y2="120" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="115" y1="118" x2="135" y2="120" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs bent on ground */}
      <line x1="85" y1="115" x2="80" y2="143" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="115" y1="115" x2="120" y2="143" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// Triangle Pose - Intermediate
export const TrianglePose = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes triangle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .triangler { animation: triangle 3s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="20" y="140" width="160" height="8" fill="#D3D3D3" rx="2" />

    {/* Person in triangle */}
    <g className="triangler">
      {/* Head */}
      <circle cx="95" cy="65" r="10" fill="#E8D4C0" />

      {/* Side body stretch */}
      <line x1="100" y1="75" x2="100" y2="130" stroke="#FF6B6B" strokeWidth="11" strokeLinecap="round" />

      {/* Upper arm reaching up */}
      <line x1="100" y1="82" x2="80" y2="45" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Lower arm on leg */}
      <line x1="100" y1="85" x2="100" y2="135" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Front leg */}
      <line x1="100" y1="130" x2="92" y2="158" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

      {/* Back leg straight */}
      <line x1="100" y1="130" x2="125" y2="158" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// Plank Flow - Intermediate
export const PlankFlow = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes plankFlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .plankFlow { animation: plankFlow 2.4s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="20" y="140" width="160" height="8" fill="#D3D3D3" rx="2" />

    {/* Person in plank flow */}
    <g className="plankFlow">
      {/* Head */}
      <circle cx="50" cy="105" r="9" fill="#E8D4C0" />

      {/* Body horizontal */}
      <line x1="60" y1="110" x2="140" y2="110" stroke="#FF6B6B" strokeWidth="12" strokeLinecap="round" />

      {/* Arms supporting */}
      <line x1="60" y1="110" x2="40" y2="125" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="140" y1="110" x2="160" y2="125" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs extended */}
      <line x1="135" y1="110" x2="130" y2="148" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="145" y1="110" x2="150" y2="148" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// Crow Pose - Advanced
export const CrowPose = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes crowBalance {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .crow { animation: crowBalance 3.4s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="20" y="140" width="160" height="8" fill="#D3D3D3" rx="2" />

    {/* Person in crow pose */}
    <g className="crow">
      {/* Head looking down */}
      <circle cx="85" cy="90" r="9" fill="#E8D4C0" />

      {/* Body folded */}
      <ellipse cx="85" cy="108" rx="11" ry="18" fill="#FF6B6B" />

      {/* Arms supporting (bent) */}
      <line x1="76" y1="100" x2="55" y2="110" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="94" y1="100" x2="115" y2="110" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs up folded */}
      <line x1="80" y1="126" x2="70" y2="135" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="90" y1="126" x2="100" y2="135" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// Handstand Prep - Advanced
export const HandstandPrep = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes handstandPrep {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .handstandPrepper { animation: handstandPrep 2.8s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="20" y="140" width="160" height="8" fill="#D3D3D3" rx="2" />

    {/* Person in handstand prep */}
    <g className="handstandPrepper">
      {/* Head upside down */}
      <circle cx="70" cy="75" r="9" fill="#E8D4C0" />

      {/* Body mostly upright */}
      <line x1="70" y1="84" x2="70" y2="120" stroke="#FF6B6B" strokeWidth="11" strokeLinecap="round" />

      {/* Arms supporting on ground */}
      <line x1="64" y1="84" x2="45" y2="100" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="76" y1="84" x2="95" y2="100" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* One leg up high */}
      <line x1="66" y1="120" x2="60" y2="145" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      {/* Other leg on ground */}
      <line x1="74" y1="120" x2="75" y2="143" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// ===== STRETCHING =====

// Neck Stretch - Beginner
export const NeckStretch = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes neckTilt {
          0%, 100% { transform: rotateZ(-20deg); transform-origin: 100px 70px; }
          50% { transform: rotateZ(20deg); transform-origin: 100px 70px; }
        }
        .necker { animation: neckTilt 2.4s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head tilting */}
    <g className="necker">
      <circle cx="100" cy="70" r="12" fill="#E8D4C0" />
    </g>

    {/* Body */}
    <rect x="90" y="85" width="20" height="40" fill="#FF6B6B" rx="2" />

    {/* Arms at sides */}
    <line x1="90" y1="95" x2="65" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    <line x1="110" y1="95" x2="135" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Legs */}
    <line x1="92" y1="125" x2="88" y2="160" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="108" y1="125" x2="112" y2="160" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// Quad Stretch - Beginner
export const QuadStretch = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes quadPull {
          0%, 100% { transform: rotateZ(0deg); }
          50% { transform: rotateZ(-15deg); }
        }
        .quadStretcher { animation: quadPull 2.2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Person stretching quad */}
    <g className="quadStretcher">
      {/* Head */}
      <circle cx="75" cy="60" r="11" fill="#E8D4C0" />

      {/* Body balanced on one leg */}
      <rect x="67" y="73" width="16" height="35" fill="#FF6B6B" rx="2" />

      {/* Arm on hip */}
      <line x1="83" y1="83" x2="105" y2="75" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Other arm pulling leg */}
      <line x1="67" y1="95" x2="55" y2="110" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Standing leg */}
      <line x1="73" y1="108" x2="70" y2="160" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

      {/* Stretched leg pulled up */}
      <line x1="81" y1="108" x2="85" y2="130" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// Hamstring Reach - Beginner
export const HamstringReach = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes hamstringReach {
          0%, 100% { transform: rotateZ(0deg); transform-origin: 100px 85px; }
          50% { transform: rotateZ(-30deg); transform-origin: 100px 85px; }
        }
        .reacher { animation: hamstringReach 2.6s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Person reaching hamstring */}
    <g className="reacher">
      {/* Head */}
      <circle cx="100" cy="55" r="10" fill="#E8D4C0" />

      {/* Body folding forward */}
      <line x1="100" y1="65" x2="100" y2="125" stroke="#FF6B6B" strokeWidth="11" strokeLinecap="round" />

      {/* Arms reaching down */}
      <line x1="95" y1="90" x2="90" y2="145" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="105" y1="90" x2="110" y2="145" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Legs straight */}
    <line x1="98" y1="125" x2="95" y2="160" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="102" y1="125" x2="105" y2="160" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// Deep Lunge Stretch - Intermediate
export const DeepLungeStretch = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes deepLunge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .lunger { animation: deepLunge 2.8s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Person in deep lunge */}
    <g className="lunger">
      {/* Head */}
      <circle cx="100" cy="60" r="11" fill="#E8D4C0" />

      {/* Body upright */}
      <rect x="92" y="73" width="16" height="32" fill="#FF6B6B" rx="2" />

      {/* Arms reaching up */}
      <line x1="92" y1="75" x2="70" y2="45" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="108" y1="75" x2="130" y2="45" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Front leg bent deep lunge */}
    <line x1="96" y1="105" x2="90" y2="150" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="90" y1="150" x2="88" y2="160" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Back leg extended */}
    <line x1="104" y1="105" x2="120" y2="160" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// Thoracic Rotation - Intermediate
export const ThoracicRotation = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes thoracicRotate {
          0%, 100% { transform: rotateZ(-25deg); transform-origin: 100px 95px; }
          50% { transform: rotateZ(25deg); transform-origin: 100px 95px; }
        }
        .rotator { animation: thoracicRotate 2.4s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Person rotating thoracic */}
    <g className="rotator">
      {/* Head */}
      <circle cx="100" cy="60" r="11" fill="#E8D4C0" />

      {/* Body rotating */}
      <rect x="92" y="73" width="16" height="35" fill="#FF6B6B" rx="2" />

      {/* Arms extending out */}
      <line x1="100" y1="85" x2="55" y2="75" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="95" x2="145" y2="95" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Legs grounded */}
    <line x1="94" y1="108" x2="90" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="106" y1="108" x2="110" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// Splits - Advanced
export const Splits = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes splitter {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .split { animation: splitter 3s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Person in splits */}
    <g className="split">
      {/* Head */}
      <circle cx="100" cy="65" r="10" fill="#E8D4C0" />

      {/* Body upright on splits */}
      <line x1="100" y1="75" x2="100" y2="110" stroke="#FF6B6B" strokeWidth="11" strokeLinecap="round" />

      {/* Arms supporting */}
      <line x1="95" y1="80" x2="70" y2="70" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="105" y1="80" x2="130" y2="70" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Front leg extended */}
      <line x1="100" y1="110" x2="80" y2="160" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

      {/* Back leg extended opposite */}
      <line x1="100" y1="110" x2="120" y2="160" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// Deep Backbend - Advanced
export const DeepBackbend = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes backbend {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .bender { animation: backbend 2.8s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Person in deep backbend */}
    <g className="bender">
      {/* Head back */}
      <circle cx="100" cy="60" r="10" fill="#E8D4C0" />

      {/* Back body arched */}
      <path d="M 100 70 Q 95 95 100 125" stroke="#FF6B6B" strokeWidth="11" fill="none" strokeLinecap="round" />

      {/* Arms reaching back */}
      <line x1="95" y1="85" x2="75" y2="65" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="105" y1="85" x2="125" y2="65" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Legs on ground */}
    <line x1="98" y1="125" x2="94" y2="160" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="102" y1="125" x2="106" y2="160" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// ===== WARMUPS =====

// Arm Swings - Beginner
export const ArmSwingsWarmup = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes armSwing {
          0%, 100% { transform: rotate(-30deg) translateX(-10px); transform-origin: 100px 85px; }
          50% { transform: rotate(30deg) translateX(10px); transform-origin: 100px 85px; }
        }
        .swinger { animation: armSwing 1.6s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="60" r="12" fill="#E8D4C0" />

    {/* Body */}
    <rect x="90" y="75" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Swinging arms */}
    <g className="swinger">
      <line x1="90" y1="85" x2="50" y2="70" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="85" x2="150" y2="70" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Legs */}
    <line x1="92" y1="110" x2="88" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="108" y1="110" x2="112" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// Marching - Beginner
export const MarchingWarmup = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes march {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-15px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-15px); }
        }
        .marcher { animation: march 1.8s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="60" r="12" fill="#E8D4C0" />

    {/* Body */}
    <rect x="90" y="75" width="20" height="35" fill="#FF6B6B" rx="2" />

    {/* Arms swinging */}
    <line x1="90" y1="85" x2="70" y2="75" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    <line x1="110" y1="85" x2="130" y2="75" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* Marching legs */}
    <g className="marcher">
      <line x1="92" y1="110" x2="88" y2="150" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="110" x2="112" y2="150" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// High Knees - Intermediate
export const HighKneesWarmup = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes highKnee {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        .highKneeer { animation: highKnee 1.6s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="55" r="12" fill="#E8D4C0" />

    {/* Body */}
    <rect x="90" y="70" width="20" height="32" fill="#FF6B6B" rx="2" />

    {/* Arms pumping */}
    <line x1="90" y1="80" x2="70" y2="65" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    <line x1="110" y1="80" x2="130" y2="65" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

    {/* High knee running */}
    <g className="highKneeer">
      <line x1="92" y1="102" x2="88" y2="125" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="102" x2="110" y2="145" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// Jumping Jacks - Intermediate
export const JumpingJacksWarmup = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes jumpingJack {
          0%, 100% { transform: translateY(30px); }
          50% { transform: translateY(-15px); }
        }
        .jacker { animation: jumpingJack 1.8s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="55" r="12" fill="#E8D4C0" />

    {/* Body */}
    <g className="jacker">
      <rect x="90" y="70" width="20" height="32" fill="#FF6B6B" rx="2" />

      {/* Arms up */}
      <line x1="90" y1="75" x2="60" y2="40" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="75" x2="140" y2="40" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs apart */}
      <line x1="92" y1="102" x2="75" y2="150" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="102" x2="125" y2="150" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// Skater Hops - Advanced
export const SkaterHopsWarmup = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes skaterHop {
          0%, 100% { transform: translateX(-20px) translateY(25px); }
          50% { transform: translateX(20px) translateY(-15px); }
        }
        .skater { animation: skaterHop 1.8s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="60" r="12" fill="#E8D4C0" />

    {/* Body dynamic */}
    <g className="skater">
      <rect x="90" y="75" width="20" height="32" fill="#FF6B6B" rx="2" />

      {/* Dynamic arms */}
      <line x1="90" y1="85" x2="55" y2="75" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="85" x2="145" y2="75" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Skater legs */}
      <line x1="92" y1="107" x2="75" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="107" x2="125" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// Burpee Warm-up - Advanced
export const BurpeeWarmupExercise = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes burpee {
          0%, 100% { transform: translateY(40px); }
          33% { transform: translateY(0); }
          66% { transform: translateY(-30px); }
        }
        .burpeer { animation: burpee 2.2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Person doing burpee */}
    <g className="burpeer">
      {/* Head */}
      <circle cx="100" cy="55" r="11" fill="#E8D4C0" />

      {/* Body */}
      <rect x="90" y="68" width="20" height="32" fill="#FF6B6B" rx="2" />

      {/* Arms */}
      <line x1="90" y1="78" x2="65" y2="65" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="78" x2="135" y2="65" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs */}
      <line x1="92" y1="100" x2="88" y2="145" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="100" x2="112" y2="145" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

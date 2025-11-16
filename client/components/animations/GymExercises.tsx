import React from "react";

// Wall Pushups - Beginner
export const WallPushups = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes wallPushup {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-15px); }
        }
        .pusher { animation: wallPushup 2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Wall */}
    <rect x="10" y="50" width="10" height="150" fill="#666" />
    <line x1="10" y1="70" x2="20" y2="70" stroke="#999" strokeWidth="1" />
    <line x1="10" y1="100" x2="20" y2="100" stroke="#999" strokeWidth="1" />
    <line x1="10" y1="130" x2="20" y2="130" stroke="#999" strokeWidth="1" />

    {/* Person Group - Pusher */}
    <g className="pusher">
      {/* Head */}
      <circle cx="60" cy="70" r="12" fill="#E8D4C0" />

      {/* Body */}
      <rect x="50" y="85" width="20" height="35" fill="#FF6B6B" rx="3" />

      {/* Arms */}
      <line x1="50" y1="90" x2="25" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="70" y1="90" x2="10" y2="85" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs */}
      <line x1="52" y1="120" x2="48" y2="155" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="68" y1="120" x2="72" y2="155" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// Incline Pushups - Beginner
export const InclinePushups = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes inclinePushup {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .inclineBody { animation: inclinePushup 2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Bench */}
    <rect x="40" y="120" width="120" height="12" fill="#8B7355" rx="2" />
    <rect x="45" y="130" width="8" height="30" fill="#8B7355" />
    <rect x="147" y="130" width="8" height="30" fill="#8B7355" />

    {/* Person Group - Incline Body */}
    <g className="inclineBody">
      {/* Head */}
      <circle cx="100" cy="100" r="10" fill="#E8D4C0" />

      {/* Torso */}
      <rect x="92" y="112" width="16" height="30" fill="#FF6B6B" rx="2" />

      {/* Arms */}
      <line x1="92" y1="118" x2="60" y2="95" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="108" y1="118" x2="140" y2="95" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs */}
      <line x1="94" y1="142" x2="88" y2="165" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="106" y1="142" x2="112" y2="165" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="170" x2="200" y2="170" stroke="#999" strokeWidth="2" />
  </svg>
);

// Squats - Beginner
export const Squats = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes squat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(30px); }
        }
        .squatter { animation: squat 2.5s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Person Group - Squatter */}
    <g className="squatter">
      {/* Head */}
      <circle cx="100" cy="50" r="12" fill="#E8D4C0" />

      {/* Body */}
      <rect x="90" y="65" width="20" height="30" fill="#FF6B6B" rx="2" />

      {/* Arms */}
      <line x1="90" y1="75" x2="70" y2="65" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="75" x2="130" y2="65" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Thighs */}
      <line x1="92" y1="95" x2="85" y2="125" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="95" x2="115" y2="125" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

      {/* Calves */}
      <line x1="85" y1="125" x2="82" y2="155" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="115" y1="125" x2="118" y2="155" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="160" x2="200" y2="160" stroke="#999" strokeWidth="2" />
  </svg>
);

// Crunches - Beginner
export const Crunches = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes crunch {
          0%, 100% { transform: rotateZ(0deg); transform-origin: 100px 120px; }
          50% { transform: rotateZ(-20deg); transform-origin: 100px 120px; }
        }
        .cruncher { animation: crunch 2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="30" y="140" width="140" height="8" fill="#D3D3D3" rx="2" />

    {/* Person Group - Cruncher */}
    <g className="cruncher">
      {/* Head */}
      <circle cx="100" cy="70" r="10" fill="#E8D4C0" />

      {/* Body/Torso */}
      <ellipse cx="100" cy="105" rx="15" ry="25" fill="#FF6B6B" />

      {/* Arms behind head */}
      <line x1="90" y1="85" x2="75" y2="70" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="85" x2="125" y2="70" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs */}
      <line x1="92" y1="130" x2="88" y2="148" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="130" x2="112" y2="148" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// Supermans - Beginner
export const Supermans = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes superman {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .supermanned { animation: superman 2.5s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="20" y="140" width="160" height="8" fill="#D3D3D3" rx="2" />

    {/* Person Group - Superman */}
    <g className="supermanned">
      {/* Head */}
      <circle cx="100" cy="85" r="10" fill="#E8D4C0" />

      {/* Body stretched out */}
      <ellipse cx="100" cy="110" rx="12" ry="18" fill="#FF6B6B" />

      {/* Arms extended */}
      <line x1="88" y1="100" x2="40" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="112" y1="100" x2="160" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs extended */}
      <line x1="92" y1="128" x2="70" y2="145" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="108" y1="128" x2="130" y2="145" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// Arm Circles - Beginner
export const ArmCircles = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes armCircleLeft {
          0% { transform: rotate(0deg); transform-origin: 90px 85px; }
          100% { transform: rotate(360deg); transform-origin: 90px 85px; }
        }
        @keyframes armCircleRight {
          0% { transform: rotate(0deg); transform-origin: 110px 85px; }
          100% { transform: rotate(-360deg); transform-origin: 110px 85px; }
        }
        .armLeft { animation: armCircleLeft 2s linear infinite; }
        .armRight { animation: armCircleRight 2s linear infinite; }
      `}</style>
    </defs>

    {/* Head */}
    <circle cx="100" cy="60" r="11" fill="#E8D4C0" />

    {/* Body */}
    <rect x="92" y="75" width="16" height="35" fill="#FF6B6B" rx="2" />

    {/* Left Arm Circle */}
    <line x1="92" y1="80" x2="50" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" className="armLeft" />

    {/* Right Arm Circle */}
    <line x1="108" y1="80" x2="150" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" className="armRight" />

    {/* Legs */}
    <line x1="94" y1="110" x2="90" y2="150" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    <line x1="106" y1="110" x2="110" y2="150" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />

    {/* Ground */}
    <line x1="0" y1="160" x2="200" y2="160" stroke="#999" strokeWidth="2" />
  </svg>
);

// Decline Pushups - Intermediate
export const DeclinePushups = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes declinePushup {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(12px); }
        }
        .declineBody { animation: declinePushup 2.2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Decline Bench */}
    <path d="M 40 100 L 160 130 L 160 140 L 40 110 Z" fill="#8B7355" />
    <rect x="35" y="140" width="8" height="25" fill="#8B7355" />
    <rect x="157" y="145" width="8" height="20" fill="#8B7355" />

    {/* Person Group - Decline Body */}
    <g className="declineBody">
      {/* Head */}
      <circle cx="80" cy="75" r="10" fill="#E8D4C0" />

      {/* Torso */}
      <rect x="72" y="88" width="16" height="32" fill="#FF6B6B" rx="2" />

      {/* Arms */}
      <line x1="72" y1="95" x2="40" y2="70" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="88" y1="95" x2="120" y2="70" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs */}
      <line x1="74" y1="120" x2="60" y2="145" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="86" y1="120" x2="100" y2="145" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// Jump Squats - Intermediate
export const JumpSquats = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes jumpSquat {
          0%, 100% { transform: translateY(40px); }
          50% { transform: translateY(-20px); }
        }
        .jumper { animation: jumpSquat 2.2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Person Group - Jumper */}
    <g className="jumper">
      {/* Head */}
      <circle cx="100" cy="50" r="11" fill="#E8D4C0" />

      {/* Body */}
      <rect x="92" y="65" width="16" height="28" fill="#FF6B6B" rx="2" />

      {/* Arms up */}
      <line x1="92" y1="70" x2="70" y2="40" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="108" y1="70" x2="130" y2="40" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs */}
      <line x1="94" y1="93" x2="88" y2="125" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="106" y1="93" x2="112" y2="125" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="160" x2="200" y2="160" stroke="#999" strokeWidth="2" />
  </svg>
);

// Pike Pushups - Intermediate
export const PikePushups = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes pikePushup {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(15px); }
        }
        .pikeBody { animation: pikePushup 2.3s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Person Group - Pike Body */}
    <g className="pikeBody">
      {/* Head (down position) */}
      <circle cx="100" cy="75" r="10" fill="#E8D4C0" />

      {/* Arms on ground */}
      <line x1="90" y1="85" x2="55" y2="100" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="85" x2="145" y2="100" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Body at angle */}
      <line x1="100" y1="85" x2="100" y2="130" stroke="#FF6B6B" strokeWidth="12" strokeLinecap="round" />

      {/* Hips up */}
      <circle cx="100" cy="115" r="8" fill="#FF6B6B" />

      {/* Legs */}
      <line x1="100" y1="130" x2="95" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="100" y1="130" x2="105" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Bulgarian Split Squats - Intermediate
export const BulgarianSplitSquats = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes bulgSplit {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(20px); }
        }
        .bulgSplitter { animation: bulgSplit 2.4s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Bench behind */}
    <rect x="130" y="110" width="50" height="12" fill="#8B7355" rx="2" />

    {/* Person Group - Bulgarian Splitter */}
    <g className="bulgSplitter">
      {/* Head */}
      <circle cx="80" cy="55" r="10" fill="#E8D4C0" />

      {/* Body */}
      <rect x="72" y="68" width="16" height="32" fill="#FF6B6B" rx="2" />

      {/* Arms */}
      <line x1="80" y1="75" x2="60" y2="65" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="88" y1="75" x2="108" y2="65" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Front leg bent */}
      <line x1="74" y1="100" x2="70" y2="135" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="70" y1="135" x2="68" y2="155" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Back leg on bench */}
      <line x1="86" y1="100" x2="155" y2="110" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="160" x2="200" y2="160" stroke="#999" strokeWidth="2" />
  </svg>
);

// Plank Variations - Intermediate
export const PlanksVariation = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes plankHold {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .planker { animation: plankHold 2s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Mat */}
    <rect x="20" y="140" width="160" height="8" fill="#D3D3D3" rx="2" />

    {/* Person Group - Plank */}
    <g className="planker">
      {/* Head */}
      <circle cx="50" cy="105" r="9" fill="#E8D4C0" />

      {/* Body stretched horizontal */}
      <line x1="60" y1="110" x2="140" y2="110" stroke="#FF6B6B" strokeWidth="14" strokeLinecap="round" />

      {/* Arms */}
      <line x1="60" y1="110" x2="40" y2="120" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="140" y1="110" x2="160" y2="120" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs */}
      <line x1="135" y1="110" x2="130" y2="145" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="145" y1="110" x2="150" y2="145" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>
  </svg>
);

// Clap Pushups - Advanced
export const ClapPushups = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes clapPushup {
          0%, 100% { transform: translateY(-30px); }
          50% { transform: translateY(10px); }
        }
        @keyframes clapHands {
          0%, 100% { transform: translateX(-20px) rotate(0deg); }
          50% { transform: translateX(0) rotate(10deg); }
        }
        .clapPusher { animation: clapPushup 1.8s ease-in-out infinite; }
        .clapHandLeft { animation: clapHands 1.8s ease-in-out infinite; }
        .clapHandRight { animation: clapHands 1.8s ease-in-out infinite reverse; }
      `}</style>
    </defs>

    {/* Person Group - Clap Pusher */}
    <g className="clapPusher">
      {/* Head */}
      <circle cx="100" cy="65" r="10" fill="#E8D4C0" />

      {/* Body */}
      <rect x="92" y="78" width="16" height="28" fill="#FF6B6B" rx="2" />

      {/* Left hand for clap */}
      <circle cx="88" cy="95" r="6" fill="#E8D4C0" className="clapHandLeft" />

      {/* Right hand for clap */}
      <circle cx="112" cy="95" r="6" fill="#E8D4C0" className="clapHandRight" />

      {/* Legs */}
      <line x1="94" y1="106" x2="88" y2="140" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="106" y1="106" x2="112" y2="140" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="155" x2="200" y2="155" stroke="#999" strokeWidth="2" />
  </svg>
);

// Archer Pushups - Advanced
export const ArcherPushups = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes archerPushup {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(15px); }
        }
        .archerBody { animation: archerPushup 2.3s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Person Group - Archer Body */}
    <g className="archerBody">
      {/* Head */}
      <circle cx="100" cy="75" r="10" fill="#E8D4C0" />

      {/* Body angled */}
      <line x1="100" y1="85" x2="100" y2="115" stroke="#FF6B6B" strokeWidth="12" strokeLinecap="round" />

      {/* Left arm extended (pushing) */}
      <line x1="92" y1="90" x2="50" y2="90" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Right arm bent */}
      <line x1="108" y1="90" x2="130" y2="100" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs */}
      <line x1="96" y1="115" x2="92" y2="150" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="104" y1="115" x2="108" y2="150" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="160" x2="200" y2="160" stroke="#999" strokeWidth="2" />
  </svg>
);

// Pistol Squats - Advanced
export const PistolSquats = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes pistolSquat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(25px); }
        }
        .pistolSitter { animation: pistolSquat 2.5s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Person Group - Pistol Squatter */}
    <g className="pistolSitter">
      {/* Head */}
      <circle cx="100" cy="60" r="11" fill="#E8D4C0" />

      {/* Body */}
      <rect x="92" y="73" width="16" height="28" fill="#FF6B6B" rx="2" />

      {/* Arm up for balance */}
      <line x1="92" y1="80" x2="70" y2="50" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="108" y1="80" x2="130" y2="80" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Standing leg bent */}
      <line x1="94" y1="101" x2="92" y2="140" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="92" y1="140" x2="90" y2="160" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Extended leg */}
      <line x1="106" y1="101" x2="125" y2="120" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="125" y1="120" x2="140" y2="135" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Inverted Rows - Advanced
export const InvertedRows = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes invertedRow {
          0%, 100% { transform: translateY(15px); }
          50% { transform: translateY(-10px); }
        }
        .inverted { animation: invertedRow 2.3s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Bar */}
    <rect x="30" y="50" width="140" height="6" fill="#555" rx="2" />
    <circle cx="35" cy="53" r="4" fill="#777" />
    <circle cx="165" cy="53" r="4" fill="#777" />

    {/* Person Group - Inverted */}
    <g className="inverted">
      {/* Head */}
      <circle cx="100" cy="95" r="10" fill="#E8D4C0" />

      {/* Body angled */}
      <line x1="100" y1="105" x2="100" y2="135" stroke="#FF6B6B" strokeWidth="12" strokeLinecap="round" />

      {/* Arms pulling */}
      <line x1="92" y1="110" x2="35" y2="53" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="108" y1="110" x2="165" y2="53" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Legs */}
      <line x1="96" y1="135" x2="92" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="104" y1="135" x2="108" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

// Handstand Pushup Progressions - Advanced
export const HandstandPushups = () => (
  <svg viewBox="0 0 200 300" className="w-full h-full">
    <defs>
      <style>{`
        @keyframes handstandPushup {
          0%, 100% { transform: translateY(10px); }
          50% { transform: translateY(-15px); }
        }
        .handstander { animation: handstandPushup 2.4s ease-in-out infinite; }
      `}</style>
    </defs>

    {/* Wall */}
    <rect x="10" y="50" width="8" height="130" fill="#999" />
    <line x1="10" y1="70" x2="18" y2="70" stroke="#AAA" strokeWidth="1" />
    <line x1="10" y1="100" x2="18" y2="100" stroke="#AAA" strokeWidth="1" />
    <line x1="10" y1="130" x2="18" y2="130" stroke="#AAA" strokeWidth="1" />

    {/* Person Group - Handstander */}
    <g className="handstander">
      {/* Head/face area at top */}
      <circle cx="40" cy="70" r="9" fill="#E8D4C0" />

      {/* Arms pushing into ground */}
      <line x1="35" y1="79" x2="30" y2="100" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />
      <line x1="45" y1="79" x2="50" y2="100" stroke="#E8D4C0" strokeWidth="4" strokeLinecap="round" />

      {/* Body vertical */}
      <line x1="40" y1="79" x2="40" y2="125" stroke="#FF6B6B" strokeWidth="11" strokeLinecap="round" />

      {/* Legs up vertical */}
      <line x1="36" y1="125" x2="32" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <line x1="44" y1="125" x2="48" y2="155" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
    </g>

    {/* Ground */}
    <line x1="0" y1="165" x2="200" y2="165" stroke="#999" strokeWidth="2" />
  </svg>
);

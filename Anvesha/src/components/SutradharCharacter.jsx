import React from 'react';

const SutradharCharacter = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 select-none">
      {/* CSS Animation definitions embedded */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.4)); opacity: 0.8; }
          50% { filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.8)); opacity: 1.0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.5; }
          100% { transform: scale(0.95); opacity: 0.2; }
        }
        .float-anim {
          animation: float 4s ease-in-out infinite;
        }
        .glow-anim {
          animation: glow 3s ease-in-out infinite;
        }
        .ring-anim {
          animation: pulse-ring 6s ease-in-out infinite;
          transform-origin: center;
        }
      `}} />

      <div className="relative w-64 h-64 flex items-center justify-center float-anim">
        {/* Glowing aura rings */}
        <div className="absolute w-52 h-52 rounded-full border border-gold/20 ring-anim"></div>
        <div className="absolute w-44 h-44 rounded-full border border-gold/10 ring-anim" style={{ animationDelay: '2s' }}></div>

        {/* Custom SVG Sutradhar sage character */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full glow-anim"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 1. Glowing spiritual halo */}
          <circle cx="100" cy="80" r="45" fill="url(#haloGrad)" opacity="0.8" />
          <circle cx="100" cy="80" r="40" stroke="#d4af37" strokeWidth="1" strokeDasharray="3 3" />

          {/* 2. Saffron Stole / Robe (Back) */}
          <path d="M70 120 C70 95, 130 95, 130 120 L145 180 L55 180 Z" fill="#ea580c" />

          {/* 3. Body / Torso (Kurta) */}
          <path d="M78 120 C78 110, 122 110, 122 120 L130 180 H70 Z" fill="#fef3c7" />

          {/* 4. Saffron Sash (Diagonal drape) */}
          <path d="M70 120 Q100 135 125 125 L130 140 Q100 150 70 130 Z" fill="#c2410c" />

          {/* 5. Sage head / face */}
          <circle cx="100" cy="80" r="22" fill="#fed7aa" />

          {/* 6. White Hair and Beard */}
          {/* Hair */}
          <path d="M78 80 C74 65, 126 65, 122 80 C125 78, 126 84, 124 88 C120 74, 80 74, 76 88 C74 84, 75 78, 78 80 Z" fill="#f8fafc" />
          {/* Beard */}
          <path d="M80 84 C80 115, 120 115, 120 84 C116 100, 84 100, 80 84 Z" fill="#f8fafc" />
          <path d="M90 92 C90 112, 110 112, 110 92 C104 102, 96 102, 90 92 Z" fill="#e2e8f0" />

          {/* 7. Face Features */}
          {/* Eyes (meditating closed eyes) */}
          <path d="M90 78 Q94 81 97 78" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M103 78 Q106 81 110 78" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
          {/* Eyebrows */}
          <path d="M88 74 Q94 71 98 74" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M102 74 Q106 71 112 74" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          {/* Saffron Tilak on forehead */}
          <path d="M99 64 C99 60, 101 60, 101 64 L101 72 C101 74, 99 74, 99 72 Z" fill="#ea580c" />
          <circle cx="100" cy="74" r="1.5" fill="#d4af37" />

          {/* 8. Rudraksha / Holy beads necklace */}
          <circle cx="85" cy="118" r="3" fill="#78350f" stroke="#b45309" strokeWidth="0.5" />
          <circle cx="91" cy="123" r="3" fill="#78350f" stroke="#b45309" strokeWidth="0.5" />
          <circle cx="100" cy="125" r="3.5" fill="#d4af37" stroke="#b8901c" strokeWidth="0.5" /> {/* Central gold pendant */}
          <circle cx="109" cy="123" r="3" fill="#78350f" stroke="#b45309" strokeWidth="0.5" />
          <circle cx="115" cy="118" r="3" fill="#78350f" stroke="#b45309" strokeWidth="0.5" />

          {/* 9. Holy Scroll held in hands */}
          <rect x="75" y="145" width="50" height="12" rx="4" fill="#ded5b8" stroke="#b8901c" strokeWidth="1.5" />
          <rect x="85" y="145" width="4" height="12" fill="#991b1b" /> {/* Ribbon tie */}

          {/* Gradient definitions */}
          <defs>
            <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#d4af37" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="text-center mt-3">
        <h4 className="text-gold font-display font-bold tracking-wide">THE SUTRADHAR</h4>
        <p className="text-[10px] text-parchment-dark tracking-widest uppercase">Guardian of Cosmic Memories</p>
      </div>
    </div>
  );
};

export default SutradharCharacter;

import { useState, useEffect } from 'react';
import { MessageSquare, X, HelpCircle, Lightbulb, Sparkles, AlertCircle } from 'lucide-react';

const HERITAGE_FACTS = [
  "The iron pillar of Delhi, standing inside the Qutb complex, has survived over 1,600 years without rusting—a marvel of ancient Indian metallurgical engineering.",
  "Nalanda University's library, Dharma Gunj (Mountain of Truth), was so vast that it burned for three months after being set ablaze in the 12th century.",
  "The game of Snakes and Ladders originated in ancient India as 'Moksha Patam,' serving as a moral lesson to teach children about karma, virtues, and vices.",
  "The majestic Brihadisvara Temple in Thanjavur is made entirely of granite, and its massive 80-ton dome was raised to the top using a 6-kilometer long ramp.",
  "The ancient Indus Valley city of Dholavira featured sophisticated water management, including giant stone-cut reservoirs to harvest and store rainfall.",
  "Sushruta, writing the Sushruta Samhita in 600 BCE, is recognized as the 'Father of Surgery,' describing reconstructive rhinoplasty and 120+ surgical instruments."
];

const HERITAGE_RIDDLES = [
  {
    question: "I have no voice, yet I speak of the past. I have no eyes, yet I show you ancient paths. What am I?",
    answer: "An ancient manuscript (Pothi) or palm-leaf scroll."
  },
  {
    question: "Carved from a single giant basalt cliff, I represent Shiva's celestial abode. No stones were added to me, only cut away. What temple am I?",
    answer: "The Kailash Temple at Ellora Caves."
  },
  {
    question: "Built like an inverted stepwell temple leading down to the water, I am adorned with intricate carvings of Vishnu's ten avatars. What am I?",
    answer: "Rani ki Vav (The Queen's Stepwell) in Patan, Gujarat."
  },
  {
    question: "I am a thread that binds, but I am not made of cotton. I hold the story together, but I am not a book. In this quest to save Bharat's history, I guide you. Who am I?",
    answer: "The Sutradhar (the narrator / thread-holder)."
  }
];

const SutradharGuide = ({ activeTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('GUIDE'); // 'GUIDE', 'FACT', 'RIDDLE'
  const [factIndex, setFactIndex] = useState(0);
  const [riddleIndex, setRiddleIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  // Trigger guidance popover automatically on first load to welcome the user,
  // but only if they haven't interacted with it yet.
  useEffect(() => {
    const hasInteracted = localStorage.getItem('sutradhar_interacted');
    if (!hasInteracted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Whenever the activeTab changes, reset back to page guidance mode
  useEffect(() => {
    setMode('GUIDE');
    setShowAnswer(false);
  }, [activeTab]);

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    setIsPulsing(false);
    localStorage.setItem('sutradhar_interacted', 'true');
  };

  const getGuideText = () => {
    switch (activeTab) {
      case 'HOME':
        return "Welcome, adventurer! I am the Sutradhar, your guide to preserving India's heritage. Choose your path: play 'Sutradhar's Maze' solo to explore ancient ruins, or join 'Lost Artifact Hunt' with friends to solve a mystery!";
      case 'SHOP':
        return "Welcome to the Bazaar! Spend the coins you gather in the game to buy extra Hearts and Shields for protection. You can also use your victory Diamonds to unlock legendary character skins!";
      case 'INVENTORY':
        return "This is your inventory. Here you can see your active skins, shields, and hearts. Select and equip any unlocked character skin to change your player avatar!";
      case 'LEADERBOARD':
        return "Check out the top players who have saved the most memories! Can you beat their scores and rise to the top of the leaderboard?";
      case 'PROFILE':
        return "This is your profile page. It shows your username, total score, wins, and the history of the coins and diamonds you've earned.";
      default:
        return "I am here to guide your footsteps through the forgotten realms. Let's reclaim history together!";
    }
  };

  const handleNextFact = () => {
    setFactIndex((prev) => (prev + 1) % HERITAGE_FACTS.length);
  };

  const handleNextRiddle = () => {
    setRiddleIndex((prev) => (prev + 1) % HERITAGE_RIDDLES.length);
    setShowAnswer(false);
  };

  return (
    <div className="select-none">
      {/* CSS Animation definitions embedded */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-micro {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
        @keyframes ring-pulse-gold {
          0% { box-shadow: 0 0 0 0px rgba(212, 175, 55, 0.6); }
          70% { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
          100% { box-shadow: 0 0 0 0px rgba(212, 175, 55, 0); }
        }
        .float-micro-anim {
          animation: float-micro 3s ease-in-out infinite;
        }
        .ring-pulse-gold-anim {
          animation: ring-pulse-gold 2s infinite;
        }
      `}} />

      {/* ── 1. Popover Guidance Window ────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-[144px] right-4 md:bottom-24 md:right-6 z-45 w-80 max-w-[calc(100vw-32px)] heritage-card border gold-border rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-5 duration-300 flex flex-col gap-3">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-royal-blue-light pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-gold" />
              <span className="text-xs font-display text-gold font-bold tracking-widest uppercase">
                Sutradhar's Guidance
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-parchment-dark hover:text-white transition-colors cursor-pointer animate-fade-in"
            >
              <X size={15} />
            </button>
          </div>

          {/* Speech area */}
          <div className="flex gap-3 items-start">
            {/* Sage Mini SVG */}
            <div className="w-12 h-12 rounded-full border border-gold/30 bg-royal-blue-dark flex items-center justify-center shrink-0 shadow overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-10 h-10">
                {/* Spiritual Halo */}
                <circle cx="50" cy="46" r="22" fill="#d4af37" opacity="0.15" />
                {/* Saffron Robe */}
                <path d="M35 70 C35 55, 65 55, 65 70 L72 99 L28 99 Z" fill="#ea580c" />
                {/* Kurta */}
                <path d="M39 70 C39 65, 61 65, 61 70 L65 99 H35 Z" fill="#fef3c7" />
                {/* Head */}
                <circle cx="50" cy="46" r="12" fill="#fed7aa" />
                {/* White Hair & Beard */}
                <path d="M38 46 C36 38, 64 38, 62 46 C64 45, 65 48, 64 50 C62 42, 38 42, 36 50 C35 48, 36 45, 38 46 Z" fill="#f8fafc" />
                <path d="M39 48 C39 65, 61 65, 61 48 C59 57, 41 57, 39 48 Z" fill="#f8fafc" />
                {/* closed eyes */}
                <path d="M44 45 Q46 47 48 45" stroke="#7c2d12" strokeWidth="1" strokeLinecap="round" />
                <path d="M52 45 Q54 47 56 45" stroke="#7c2d12" strokeWidth="1" strokeLinecap="round" />
                {/* Tilak */}
                <path d="M49.5 37 L50.5 37 L50.5 42 L49.5 42 Z" fill="#ea580c" />
                <circle cx="50" cy="43.5" r="0.7" fill="#d4af37" />
              </svg>
            </div>

            {/* Speech bubble */}
            <div className="flex-1 bg-royal-blue-dark/50 border border-royal-blue-light/30 rounded-lg p-2.5 text-xs text-parchment leading-relaxed min-h-[64px] flex flex-col justify-center">
              {mode === 'GUIDE' && <p>{getGuideText()}</p>}

              {mode === 'FACT' && (
                <div>
                  <span className="text-[9px] text-amber-400 font-display uppercase tracking-wider block mb-1">
                    ✦ Heritage Fact ✦
                  </span>
                  <p className="italic">"{HERITAGE_FACTS[factIndex]}"</p>
                </div>
              )}

              {mode === 'RIDDLE' && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-cyan-400 font-display uppercase tracking-wider block">
                    ✦ Riddle of the Past ✦
                  </span>
                  <p className="font-medium text-parchment">"{HERITAGE_RIDDLES[riddleIndex].question}"</p>
                  
                  {showAnswer ? (
                    <div className="mt-1 bg-royal-blue/60 border border-gold/20 p-2 rounded text-emerald-300 font-semibold">
                      Answer: {HERITAGE_RIDDLES[riddleIndex].answer}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="mt-1 text-[10px] text-gold hover:text-gold-light underline text-left font-display font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Reveal Answer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="grid grid-cols-3 gap-1.5 border-t border-royal-blue-light pt-2.5 text-[10px]">
            <button
              onClick={() => setMode('GUIDE')}
              className={`py-1.5 rounded text-center border font-display transition-all cursor-pointer ${
                mode === 'GUIDE'
                  ? 'border-gold bg-gold/10 text-gold font-bold'
                  : 'border-royal-blue-light text-parchment-dark hover:border-gold/30 hover:text-parchment'
              }`}
            >
              Explain Page
            </button>
            <button
              onClick={() => {
                setMode('FACT');
                if (mode === 'FACT') handleNextFact();
              }}
              className={`py-1.5 rounded text-center border font-display transition-all flex items-center justify-center gap-0.5 cursor-pointer ${
                mode === 'FACT'
                  ? 'border-gold bg-gold/10 text-gold font-bold'
                  : 'border-royal-blue-light text-parchment-dark hover:border-gold/30 hover:text-parchment'
              }`}
            >
              <Lightbulb size={9} />
              {mode === 'FACT' ? 'Next Fact' : 'Get Fact'}
            </button>
            <button
              onClick={() => {
                setMode('RIDDLE');
                if (mode === 'RIDDLE') handleNextRiddle();
              }}
              className={`py-1.5 rounded text-center border font-display transition-all flex items-center justify-center gap-0.5 cursor-pointer ${
                mode === 'RIDDLE'
                  ? 'border-gold bg-gold/10 text-gold font-bold'
                  : 'border-royal-blue-light text-parchment-dark hover:border-gold/30 hover:text-parchment'
              }`}
            >
              <HelpCircle size={9} />
              {mode === 'RIDDLE' ? 'Next Riddle' : 'Solve Riddle'}
            </button>
          </div>
        </div>
      )}

      {/* ── 2. Floating Avatar Trigger Button ────────────────────── */}
      <button
        onClick={handleOpenToggle}
        className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 float-micro-anim flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-gold bg-royal-blue-dark shadow-2xl transition-transform active:scale-95 cursor-pointer hover:border-gold-light group ${
          isPulsing ? 'ring-pulse-gold-anim' : ''
        }`}
        title="Consult the Sutradhar"
      >
        {/* Custom Mini SVG inside the bubble button */}
        <svg viewBox="0 0 100 100" className="w-10 h-10 md:w-12 md:h-12">
          {/* Spiritual Halo */}
          <circle cx="50" cy="46" r="22" fill="#d4af37" opacity="0.2" className="group-hover:opacity-35 transition-opacity" />
          <circle cx="50" cy="46" r="20" stroke="#d4af37" strokeWidth="0.5" strokeDasharray="2 2" />
          {/* Saffron Robe */}
          <path d="M35 70 C35 55, 65 55, 65 70 L72 99 L28 99 Z" fill="#ea580c" />
          {/* Head */}
          <circle cx="50" cy="46" r="12" fill="#fed7aa" />
          {/* White Hair & Beard */}
          <path d="M38 46 C36 38, 64 38, 62 46 C64 45, 65 48, 64 50 C62 42, 38 42, 36 50 Z" fill="#f8fafc" />
          <path d="M39 48 C39 65, 61 65, 61 48 C59 57, 41 57, 39 48 Z" fill="#f8fafc" />
          {/* Closed meditating eyes */}
          <path d="M44 45 Q46 47 48 45" stroke="#7c2d12" strokeWidth="1" strokeLinecap="round" />
          <path d="M52 45 Q54 47 56 45" stroke="#7c2d12" strokeWidth="1" strokeLinecap="round" />
          {/* Tilak */}
          <path d="M49.5 37 L50.5 37 L50.5 42 L49.5 42 Z" fill="#ea580c" />
          <circle cx="50" cy="43.5" r="0.7" fill="#d4af37" />
        </svg>

        {/* Small badge count/alert if not interacted */}
        {isPulsing && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 items-center justify-center">
              <AlertCircle size={10} className="text-maroon-dark" />
            </span>
          </span>
        )}
      </button>
    </div>
  );
};

export default SutradharGuide;

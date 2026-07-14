import { useState, useContext, lazy, Suspense } from 'react';
import { AuthContext } from '../context/AuthContext';
import SutradharGuide from '../components/SutradharGuide';
import { Coins, Gem, LogOut, Home, ShoppingBag, FolderOpen, BarChart3, User2 } from 'lucide-react';

const SutradharMaze = lazy(() => import('../components/SutradharMaze'));
const LostArtifactHunt = lazy(() => import('../components/LostArtifactHunt'));
const ShopTab = lazy(() => import('../components/ShopTab'));
const InventoryTab = lazy(() => import('../components/InventoryTab'));
const LeaderboardTab = lazy(() => import('../components/LeaderboardTab'));
const ProfileTab = lazy(() => import('../components/ProfileTab'));

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('HOME'); // HOME, MAZE, MULTIPLAYER, SHOP, INVENTORY, LEADERBOARD, PROFILE

  const renderTabContent = () => {
    switch (activeTab) {
      case 'HOME':
        return renderHomeTab();
      case 'MAZE':
        return <SutradharMaze onBackToDashboard={() => setActiveTab('HOME')} />;
      case 'MULTIPLAYER':
        return <LostArtifactHunt onBackToDashboard={() => setActiveTab('HOME')} />;
      case 'SHOP':
        return <ShopTab />;
      case 'INVENTORY':
        return <InventoryTab />;
      case 'LEADERBOARD':
        return <LeaderboardTab />;
      case 'PROFILE':
        return <ProfileTab />;
      default:
        return renderHomeTab();
    }
  };

  const renderHomeTab = () => {
    return (
      <div className="max-w-5xl mx-auto py-4 flex flex-col gap-8">
        {/* Hero Section */}
        <div className="text-center bg-royal-blue-dark/40 border border-gold/15 p-6 sm:p-8 rounded-xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Decorative Background Elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-gold/5 blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-maroon-light/5 blur-2xl"></div>
          
          <span className="text-[10px] sm:text-xs font-display text-gold tracking-widest uppercase border border-gold/30 px-3 py-1 rounded-full bg-gold/5 inline-block mb-3 animate-pulse">
            ✦ Realm of Anvesha ✦
          </span>
          <h2 className="text-2xl sm:text-4xl font-display text-gold font-bold mb-3 tracking-wide gold-text-glow">
            Decipher the Forgotten Saga
          </h2>
          <p className="text-xs sm:text-sm text-parchment-dark max-w-2xl mx-auto leading-relaxed">
            India's cultural memories are slipping away into the void. As a Sutradhar, you must venture into ancient stepwells, mandalas, and university corridors to gather fragments of heritage and restore the eternal thread of knowledge.
          </p>
        </div>

        {/* Game Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode 1 Card: Sutradhar's Maze */}
          <div className="heritage-card p-6 rounded-lg border border-royal-blue-light hover:border-gold transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] bg-gold/15 text-gold border border-gold/30 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                  Solo Mode
                </span>
                <span className="text-xs text-gold/60 font-display">Realm Restorer</span>
              </div>
              <h3 className="text-xl sm:text-2xl text-gold font-display font-bold mb-2 group-hover:gold-text-glow transition-all">
                Sutradhar's Maze
              </h3>
              <p className="text-xs sm:text-sm text-parchment-dark mb-6 leading-relaxed font-sans">
                A solo maze adventure where you collect glowing memory fragments and answer history trivia. Watch out for the pink spirits of forgetfulness that chase you!
              </p>
            </div>
            <button
              onClick={() => setActiveTab('MAZE')}
              className="btn-heritage px-6 py-2.5 text-xs w-full sm:w-auto font-display font-semibold transition-transform active:scale-95 cursor-pointer"
            >
              Play Solo Maze
            </button>
          </div>

          {/* Mode 2 Card: Chor Sipahi */}
          <div className="heritage-card p-6 rounded-lg border border-royal-blue-light hover:border-gold transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] bg-cyan-400/15 text-cyan-400 border border-cyan-400/30 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                  Multiplayer
                </span>
                <span className="text-xs text-cyan-400/60 font-display">Co-op Deduction</span>
              </div>
              <h3 className="text-xl sm:text-2xl text-gold font-display font-bold mb-2 group-hover:gold-text-glow transition-all">
                Lost Artifact Hunt
              </h3>
              <p className="text-xs sm:text-sm text-parchment-dark mb-6 leading-relaxed font-sans">
                A multiplayer social deduction game for 3-6 players. One player is secretly the Thief (Chor) stealing artifacts, while the guards (Sipahis) must secure them, find clues, and vote the thief out!
              </p>
            </div>
            <button
              onClick={() => setActiveTab('MULTIPLAYER')}
              className="btn-heritage px-6 py-2.5 text-xs w-full sm:w-auto font-display font-semibold transition-transform active:scale-95 cursor-pointer"
            >
              Enter Multiplayer Lobby
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-maroon-dark text-parchment">
      {/* 1. Dashboard Header */}
      <header className="bg-royal-blue-dark/95 border-b border-gold/20 sticky top-0 z-30 px-3 py-2.5 sm:px-6 sm:py-4 flex justify-between items-center gap-2 sm:gap-4">
        {/* Logo / Title */}
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab('HOME')}>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gold flex items-center justify-center font-bold text-gold text-xs shadow-inner">
            T
          </div>
          <h1 className="text-xs sm:text-sm md:text-lg lg:text-xl font-display text-gold tracking-wide gold-text-glow truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
            THE LOST THREADS OF BHARAT
          </h1>
        </div>

        {/* Desktop Navbar Tabs (Hidden on Mobile) */}
        {activeTab !== 'MAZE' && activeTab !== 'MULTIPLAYER' && (
          <nav className="hidden md:flex items-center gap-1 lg:gap-3 bg-maroon-dark/40 border border-gold/10 px-1.5 py-1 rounded-lg">
            <button
              onClick={() => setActiveTab('HOME')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-display transition-all cursor-pointer ${
                activeTab === 'HOME' ? 'text-gold bg-gold/10 font-bold border border-gold/20' : 'text-parchment-dark hover:text-parchment border border-transparent'
              }`}
            >
              <Home size={13} />
              <span>Home</span>
            </button>
            <button
              onClick={() => setActiveTab('SHOP')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-display transition-all cursor-pointer ${
                activeTab === 'SHOP' ? 'text-gold bg-gold/10 font-bold border border-gold/20' : 'text-parchment-dark hover:text-parchment border border-transparent'
              }`}
            >
              <ShoppingBag size={13} />
              <span>Shop</span>
            </button>
            <button
              onClick={() => setActiveTab('INVENTORY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-display transition-all cursor-pointer ${
                activeTab === 'INVENTORY' ? 'text-gold bg-gold/10 font-bold border border-gold/20' : 'text-parchment-dark hover:text-parchment border border-transparent'
              }`}
            >
              <FolderOpen size={13} />
              <span>Treasury</span>
            </button>
            <button
              onClick={() => setActiveTab('LEADERBOARD')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-display transition-all cursor-pointer ${
                activeTab === 'LEADERBOARD' ? 'text-gold bg-gold/10 font-bold border border-gold/20' : 'text-parchment-dark hover:text-parchment border border-transparent'
              }`}
            >
              <BarChart3 size={13} />
              <span>Rankings</span>
            </button>
            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-display transition-all cursor-pointer ${
                activeTab === 'PROFILE' ? 'text-gold bg-gold/10 font-bold border border-gold/20' : 'text-parchment-dark hover:text-parchment border border-transparent'
              }`}
            >
              <User2 size={13} />
              <span>Profile</span>
            </button>
          </nav>
        )}

        {/* User stats + Logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 bg-maroon-dark/60 border border-maroon-light px-2 py-1 rounded-md text-[10px] sm:text-xs">
            <span className="text-parchment-dark font-medium hidden lg:inline">{user?.name}</span>
            <div className="h-3 w-px bg-maroon-light hidden lg:inline"></div>
            <div className="flex items-center gap-0.5 sm:gap-1 text-gold font-semibold font-display">
              <Coins size={12} />
              <span>{user?.coins || 0}</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 text-cyan-400 font-semibold font-display">
              <Gem size={12} />
              <span>{user?.diamonds || 0}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-[10px] sm:text-xs text-parchment-dark hover:text-red-400 border border-transparent hover:border-red-500/20 hover:bg-red-950/20 px-1.5 py-1 rounded transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut size={12} />
            <span className="hidden xs:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 text-gold font-display gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
            <p className="text-xs uppercase tracking-widest animate-pulse">Unrolling archives...</p>
          </div>
        }>
          {renderTabContent()}
        </Suspense>
      </main>

      {/* 3. Bottom Tab Selector (Mobile Only) */}
      {activeTab !== 'MAZE' && activeTab !== 'MULTIPLAYER' && (
        <footer className="bg-royal-blue-dark/95 border-t border-gold/15 sticky bottom-0 z-30 p-2 flex justify-around items-center md:hidden">
          <button
            onClick={() => setActiveTab('HOME')}
            className={`flex flex-col items-center gap-0.5 text-[10px] transition-all cursor-pointer ${
              activeTab === 'HOME' ? 'text-gold scale-105 font-bold' : 'text-parchment-dark hover:text-parchment'
            }`}
          >
            <Home size={16} />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab('SHOP')}
            className={`flex flex-col items-center gap-0.5 text-[10px] transition-all cursor-pointer ${
              activeTab === 'SHOP' ? 'text-gold scale-105 font-bold' : 'text-parchment-dark hover:text-parchment'
            }`}
          >
            <ShoppingBag size={16} />
            <span>Shop</span>
          </button>
          
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`flex flex-col items-center gap-0.5 text-[10px] transition-all cursor-pointer ${
              activeTab === 'INVENTORY' ? 'text-gold scale-105 font-bold' : 'text-parchment-dark hover:text-parchment'
            }`}
          >
            <FolderOpen size={16} />
            <span>Treasury</span>
          </button>
          
          <button
            onClick={() => setActiveTab('LEADERBOARD')}
            className={`flex flex-col items-center gap-0.5 text-[10px] transition-all cursor-pointer ${
              activeTab === 'LEADERBOARD' ? 'text-gold scale-105 font-bold' : 'text-parchment-dark hover:text-parchment'
            }`}
          >
            <BarChart3 size={16} />
            <span>Rankings</span>
          </button>
          
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex flex-col items-center gap-0.5 text-[10px] transition-all cursor-pointer ${
              activeTab === 'PROFILE' ? 'text-gold scale-105 font-bold' : 'text-parchment-dark hover:text-parchment'
            }`}
          >
            <User2 size={16} />
            <span>Profile</span>
          </button>
        </footer>
      )}

      {/* 4. Floating Sutradhar Guide */}
      {activeTab !== 'MAZE' && activeTab !== 'MULTIPLAYER' && (
        <SutradharGuide activeTab={activeTab} />
      )}
    </div>
  );
};

export default Dashboard;

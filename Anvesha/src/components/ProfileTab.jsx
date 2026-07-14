import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Coins, Gem, Heart, Trophy, User, ShieldAlert, Award } from 'lucide-react';

const ProfileTab = () => {
  const { user } = useContext(AuthContext);

  const getSkinProperties = (skinId) => {
    switch (skinId) {
      case 'mauryan_warrior':
        return { name: 'Mauryan Warrior', color: 'text-red-500 border-red-700 bg-red-950/20' };
      case 'gupta_scholar':
        return { name: 'Gupta Scholar', color: 'text-blue-400 border-blue-700 bg-blue-950/20' };
      case 'chola_voyager':
        return { name: 'Chola Voyager', color: 'text-cyan-400 border-cyan-700 bg-cyan-950/20' };
      case 'gold_sutradhar':
        return { name: 'Golden Sutradhar', color: 'text-yellow-400 border-yellow-700 bg-yellow-950/20 font-bold gold-text-glow' };
      default:
        return { name: 'Sutradhar Classic', color: 'text-orange-400 border-orange-700 bg-orange-950/20' };
    }
  };

  const skinInfo = getSkinProperties(user?.activeSkin || 'default');

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="heritage-card p-6 rounded-lg border gold-border">
        
        {/* Avatar / Title */}
        <div className="flex flex-col items-center border-b border-royal-blue-light pb-6 mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center bg-royal-blue-dark/50 text-gold shadow-lg mb-3">
            <User size={36} />
          </div>
          <h2 className="text-2xl text-gold font-display font-bold">{user?.name}</h2>
          <p className="text-xs text-parchment-dark mt-0.5">{user?.email}</p>
        </div>

        {/* Stats Grid */}
        <h3 className="text-sm font-display text-gold mb-3 flex items-center gap-1.5">
          <Award size={16} /> Player Stats
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          <div className="bg-royal-blue-dark/40 border border-royal-blue-light p-4 rounded flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Coins size={20} className="text-gold" />
              <span className="text-sm text-parchment-dark">Coins Balance:</span>
            </div>
            <strong className="text-gold font-display text-base">{user?.coins || 0}</strong>
          </div>

          <div className="bg-royal-blue-dark/40 border border-royal-blue-light p-4 rounded flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Gem size={20} className="text-cyan-400" />
              <span className="text-sm text-parchment-dark">Diamonds:</span>
            </div>
            <strong className="text-cyan-400 font-display text-base">{user?.diamonds || 0}</strong>
          </div>

          <div className="bg-royal-blue-dark/40 border border-royal-blue-light p-4 rounded flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Heart size={20} className="text-red-500 fill-red-500" />
              <span className="text-sm text-parchment-dark">Default Hearts:</span>
            </div>
            <strong className="text-red-500 font-display text-base">{user?.hearts || 0}</strong>
          </div>

          <div className="bg-royal-blue-dark/40 border border-royal-blue-light p-4 rounded flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trophy size={20} className="text-yellow-500" />
              <span className="text-sm text-parchment-dark">Multiplayer Wins:</span>
            </div>
            <strong className="text-yellow-500 font-display text-base">{user?.wins || 0} Wins</strong>
          </div>

        </div>

        {/* Highlight Score and Skin */}
        <div className="flex flex-col gap-3 p-4 bg-maroon-dark/50 border border-maroon-light rounded text-sm mb-2">
          <div className="flex justify-between items-center py-1 border-b border-maroon-light/40">
            <span className="text-parchment-dark">Single-player High Score:</span>
            <strong className="text-gold font-display text-base">{user?.highestScore || 0}</strong>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-parchment-dark">Active Avatar Skin:</span>
            <span className={`text-xs uppercase font-display border px-2 py-0.5 rounded ${skinInfo.color}`}>
              {skinInfo.name}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileTab;

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';
import { Check, Shield, HelpCircle, User } from 'lucide-react';

const InventoryTab = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${API_URL}/shop/status`);
      if (res.data.success) {
        setInventory(res.data.inventory);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEquipSkin = async (skinId) => {
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/shop/equip-skin`, { skinId });
      if (res.data.success) {
        setMessage(res.data.message);
        refreshUser();
        fetchInventory();
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to equip skin');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gold font-display animate-pulse">
        Loading Inventory...
      </div>
    );
  }

  const skinsList = inventory?.skins || ['default'];
  const activeSkin = inventory?.activeSkin || 'default';
  const boosters = inventory?.boosters || [];

  const getSkinDetails = (skinId) => {
    switch (skinId) {
      case 'mauryan_warrior':
        return { name: 'Mauryan Warrior', color: 'bg-red-500 border-red-700', desc: 'Inspired by Emperor Ashoka\'s legendary guards.' };
      case 'gupta_scholar':
        return { name: 'Gupta Scholar', color: 'bg-blue-500 border-blue-700', desc: 'Inspired by astronomers and scientists of Nalanda.' };
      case 'chola_voyager':
        return { name: 'Chola Voyager', color: 'bg-cyan-500 border-cyan-700', desc: 'Inspired by naval explorers of the Chola Dynasty.' };
      case 'gold_sutradhar':
        return { name: 'Golden Sutradhar', color: 'bg-yellow-500 border-yellow-700', desc: 'The ultimate golden narrator aura.' };
      default:
        return { name: 'Sutradhar Classic', color: 'bg-orange-500 border-orange-700', desc: 'Standard saffron storytelling robes.' };
    }
  };

  // Counts of boosters
  const shieldCount = boosters.filter(b => b === 'shield').length;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl text-gold font-display mb-6 border-b border-royal-blue-light pb-2">Inventory</h2>

      {message && (
        <div className="p-3 rounded text-sm mb-6 text-center font-semibold bg-emerald-900/50 border border-emerald-500 text-emerald-200">
          {message}
        </div>
      )}

      {/* Boosters Row */}
      <div className="mb-8">
        <h3 className="text-lg text-gold font-display mb-3">Power Boosters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="heritage-card p-4 rounded border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-950/40 p-2.5 border border-cyan-900 rounded shrink-0">
                <Shield className="text-cyan-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-parchment">Aegis Shields</h4>
                <p className="text-[10px] text-parchment-dark">Absorbs ghost hits in maze</p>
              </div>
            </div>
            <span className="text-xl font-bold font-display text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-3 py-1 rounded">
              {shieldCount}
            </span>
          </div>

          <div className="heritage-card p-4 rounded border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-950/40 p-2.5 border border-amber-900 rounded shrink-0">
                <HelpCircle className="text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-parchment">Hint Tokens</h4>
                <p className="text-[10px] text-parchment-dark">Available for trivia rounds</p>
              </div>
            </div>
            <span className="text-xl font-bold font-display text-gold bg-amber-950/60 border border-gold/30 px-3 py-1 rounded">
              {user?.hearts || 0} Hearts
            </span>
          </div>

        </div>
      </div>

      {/* Owned Skins */}
      <div>
        <h3 className="text-lg text-gold font-display mb-3">Unlocked Skins</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {skinsList.map((skinId) => {
            const skin = getSkinDetails(skinId);
            const isActive = activeSkin === skinId;
            return (
              <div
                key={skinId}
                className={`p-4 rounded border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-all ${
                  isActive ? 'border-gold bg-royal-blue/30' : 'border-royal-blue-light bg-royal-blue-dark/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-white shadow shrink-0 ${skin.color}`}>
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-display text-parchment font-semibold">{skin.name}</h4>
                    <p className="text-[11px] text-parchment-dark leading-snug">{skin.desc}</p>
                  </div>
                </div>

                {isActive ? (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-0.5 w-full sm:w-auto py-1"><Check size={14} /> Equipped</span>
                ) : (
                  <button
                    onClick={() => handleEquipSkin(skinId)}
                    className="btn-heritage-outline px-3 py-1.5 text-xs w-full sm:w-auto cursor-pointer"
                  >
                    Equip
                  </button>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default InventoryTab;

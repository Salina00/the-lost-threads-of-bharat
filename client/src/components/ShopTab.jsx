import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';
import { Coins, Gem, Heart, Shield, HelpCircle, Check, ShoppingCart } from 'lucide-react';

const ShopTab = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchShopStatus();
  }, []);

  const fetchShopStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/shop/status`);
      if (res.data.success) {
        setShopData(res.data);
      }
    } catch (err) {
      console.error('Error fetching shop status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyItem = async (itemType) => {
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/shop/buy-item`, {
        itemType,
        quantity: 1
      });
      if (res.data.success) {
        setMessage(res.data.message);
        setIsError(false);
        refreshUser();
        fetchShopStatus();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Purchase failed');
      setIsError(true);
    }
  };

  const handleBuySkin = async (skinId) => {
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/shop/buy-skin`, { skinId });
      if (res.data.success) {
        setMessage(res.data.message);
        setIsError(false);
        refreshUser();
        fetchShopStatus();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Purchase failed');
      setIsError(true);
    }
  };

  const handleEquipSkin = async (skinId) => {
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/shop/equip-skin`, { skinId });
      if (res.data.success) {
        setMessage(res.data.message);
        setIsError(false);
        refreshUser();
        fetchShopStatus();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to equip skin');
      setIsError(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gold font-display animate-pulse">
        Loading Shop...
      </div>
    );
  }

  const inventorySkins = shopData?.inventory?.skins || ['default'];
  const activeSkin = shopData?.inventory?.activeSkin || 'default';

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Balances Display */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-royal-blue-dark border border-royal-blue-light p-4 rounded-lg mb-6">
        <h2 className="text-xl sm:text-2xl text-gold font-display">Bazaar of Bharat</h2>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 text-gold font-semibold font-display text-sm sm:text-base">
            <Coins className="text-gold" />
            <span>{user?.coins || 0} Coins</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold font-display text-sm sm:text-base">
            <Gem className="text-cyan-400" />
            <span>{user?.diamonds || 0} Diamonds</span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm mb-6 text-center font-semibold ${
          isError ? 'bg-red-900/50 border border-red-500 text-red-200' : 'bg-emerald-900/50 border border-emerald-500 text-emerald-200'
        }`}>
          {message}
        </div>
      )}

      {/* Grid of Goods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Item Section */}
        <div>
          <h3 className="text-xl text-gold font-display mb-4 border-b border-royal-blue-light pb-2">Boosts & Utilities</h3>
          <div className="flex flex-col gap-4">
            
            {/* Heart */}
            <div className="heritage-card p-4 rounded border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-red-950/40 p-3 rounded border border-red-900 shrink-0">
                  <Heart size={28} className="text-red-500 fill-red-500" />
                </div>
                <div>
                  <h4 className="text-base text-parchment font-display font-semibold">Extra Heart</h4>
                  <p className="text-xs text-parchment-dark">Increase survival capacity in the Maze</p>
                </div>
              </div>
              <button
                onClick={() => handleBuyItem('heart')}
                className="btn-heritage py-2 px-4 text-xs flex items-center justify-center gap-1 w-full sm:w-auto cursor-pointer"
              >
                <Coins size={12} /> 10 Coins
              </button>
            </div>

            {/* Hint */}
            <div className="heritage-card p-4 rounded border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-amber-950/40 p-3 rounded border border-amber-900 shrink-0">
                  <HelpCircle size={28} className="text-amber-500" />
                </div>
                <div>
                  <h4 className="text-base text-parchment font-display font-semibold">Hint Token</h4>
                  <p className="text-xs text-parchment-dark">Eliminate wrong answers in trivia questions</p>
                </div>
              </div>
              <button
                onClick={() => handleBuyItem('hint')}
                className="btn-heritage py-2 px-4 text-xs flex items-center justify-center gap-1 w-full sm:w-auto cursor-pointer"
              >
                <Coins size={12} /> 15 Coins
              </button>
            </div>

            {/* Shield */}
            <div className="heritage-card p-4 rounded border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-950/40 p-3 rounded border border-cyan-900 shrink-0">
                  <Shield size={28} className="text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-base text-parchment font-display font-semibold">Aegis Shield</h4>
                  <p className="text-xs text-parchment-dark">Absorb one spirit hit in the single-player Maze</p>
                </div>
              </div>
              <button
                onClick={() => handleBuyItem('shield')}
                className="btn-heritage py-2 px-4 text-xs flex items-center justify-center gap-1 w-full sm:w-auto cursor-pointer"
              >
                <Coins size={12} /> 25 Coins
              </button>
            </div>

          </div>
        </div>

        {/* Skins Section */}
        <div>
          <h3 className="text-xl text-gold font-display mb-4 border-b border-royal-blue-light pb-2">Custom Character Skins</h3>
          <div className="flex flex-col gap-4">
            
            {/* Default skin check */}
            <div className="heritage-card p-4 rounded border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-500 border-2 border-orange-700 flex items-center justify-center font-bold text-white shadow shrink-0">
                  ॐ
                </div>
                <div>
                  <h4 className="text-base text-parchment font-display font-semibold">Sutradhar Classic</h4>
                  <p className="text-xs text-parchment-dark">The classic storyteller aura</p>
                </div>
              </div>
              {activeSkin === 'default' ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1 w-full sm:w-auto py-1.5"><Check size={14} /> Active</span>
              ) : (
                <button
                  onClick={() => handleEquipSkin('default')}
                  className="btn-heritage-outline py-2 px-3 text-xs w-full sm:w-auto cursor-pointer"
                >
                  Equip
                </button>
              )}
            </div>

            {shopData && Object.keys(shopData.skinsForSale).map((skinId) => {
              const skin = shopData.skinsForSale[skinId];
              const owned = inventorySkins.includes(skinId);
              const isActive = activeSkin === skinId;

              // Skin icon colors preview
              let bgClass = 'bg-red-500 border-red-700';
              let symbol = '⚔';
              if (skinId === 'gupta_scholar') { bgClass = 'bg-blue-500 border-blue-700'; symbol = '✍'; }
              if (skinId === 'chola_voyager') { bgClass = 'bg-cyan-500 border-cyan-700'; symbol = '⚓'; }
              if (skinId === 'gold_sutradhar') { bgClass = 'bg-yellow-500 border-yellow-700'; symbol = '✵'; }

              return (
                <div key={skinId} className="heritage-card p-4 rounded border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-white shadow shrink-0 ${bgClass}`}>
                      {symbol}
                    </div>
                    <div>
                      <h4 className="text-base text-parchment font-display font-semibold">{skin.name}</h4>
                      <p className="text-xs text-parchment-dark">Unlock exclusive appearance</p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1 w-full sm:w-auto py-1.5"><Check size={14} /> Active</span>
                  ) : owned ? (
                    <button
                      onClick={() => handleEquipSkin(skinId)}
                      className="btn-heritage-outline py-2 px-3 text-xs w-full sm:w-auto cursor-pointer"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuySkin(skinId)}
                      className="btn-heritage py-2 px-4 text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                    >
                      <Gem size={12} /> {skin.cost} Dia
                    </button>
                  )}
                </div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ShopTab;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import { Trophy, Medal, Star } from 'lucide-react';

const LeaderboardTab = () => {
  const [leadData, setLeadData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/leaderboard`);
      if (res.data.success) {
        setLeadData(res.data);
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gold font-display animate-pulse">
        Loading Leaderboard...
      </div>
    );
  }

  // Medals for top 3
  const getRankMedal = (index) => {
    if (index === 0) return <Medal className="text-yellow-400 fill-yellow-500" size={18} />;
    if (index === 1) return <Medal className="text-gray-300 fill-gray-400" size={18} />;
    if (index === 2) return <Medal className="text-amber-600 fill-amber-700" size={18} />;
    return <span className="text-xs text-parchment-dark font-display">{index + 1}</span>;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl text-gold font-display flex items-center justify-center gap-2">
          <Trophy className="text-gold" /> Leaderboard
        </h2>
        <p className="text-xs text-parchment-dark mt-1">Celebrating Bharat's finest memory restorers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Maze Mode Scores */}
        <div className="heritage-card p-5 rounded-lg border gold-border">
          <h3 className="text-lg text-gold font-display mb-4 border-b border-royal-blue-light pb-2 flex items-center gap-1.5 justify-center">
            <Star size={16} className="text-gold fill-gold" /> Maze High Scores
          </h3>

          <div className="overflow-hidden rounded">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-royal-blue-dark/80 text-gold font-display border-b border-royal-blue-light text-xs">
                  <th className="p-3 text-center">Rank</th>
                  <th className="p-3">Player</th>
                  <th className="p-3 text-right">High Score</th>
                </tr>
              </thead>
              <tbody>
                {leadData?.byScore.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-xs text-parchment-dark">No records found yet.</td>
                  </tr>
                ) : (
                  leadData?.byScore.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-royal-blue-light/35 bg-royal-blue-dark/20 hover:bg-royal-blue-dark/50 transition-all"
                    >
                      <td className="p-3 text-center flex items-center justify-center">{getRankMedal(idx)}</td>
                      <td className="p-3 font-semibold text-parchment">{item.name}</td>
                      <td className="p-3 text-right font-display text-gold">{item.score}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multiplayer Wins */}
        <div className="heritage-card p-5 rounded-lg border gold-border">
          <h3 className="text-lg text-gold font-display mb-4 border-b border-royal-blue-light pb-2 flex items-center gap-1.5 justify-center">
            <Trophy size={16} className="text-gold" /> Chor Sipahi Wins
          </h3>

          <div className="overflow-hidden rounded">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-royal-blue-dark/80 text-gold font-display border-b border-royal-blue-light text-xs">
                  <th className="p-3 text-center">Rank</th>
                  <th className="p-3">Player</th>
                  <th className="p-3 text-right">Victories</th>
                </tr>
              </thead>
              <tbody>
                {leadData?.byWins.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-xs text-parchment-dark">No records found yet.</td>
                  </tr>
                ) : (
                  leadData?.byWins.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-royal-blue-light/35 bg-royal-blue-dark/20 hover:bg-royal-blue-dark/50 transition-all"
                    >
                      <td className="p-3 text-center flex items-center justify-center">{getRankMedal(idx)}</td>
                      <td className="p-3 font-semibold text-parchment">{item.name}</td>
                      <td className="p-3 text-right font-display text-cyan-400 font-bold">{item.wins} Wins</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeaderboardTab;

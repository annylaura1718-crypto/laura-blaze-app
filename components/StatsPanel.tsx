import React from 'react';
import { Stats } from '../types';

interface StatsPanelProps {
  stats: Stats;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-black border border-zinc-900 p-3 rounded-lg relative overflow-hidden group hover:border-green-900 transition-colors">
        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Wins (SG)</p>
        <p className="text-2xl font-black text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">{stats.wins}</p>
      </div>

      <div className="bg-black border border-zinc-900 p-3 rounded-lg relative overflow-hidden group hover:border-red-900 transition-colors">
        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Losses</p>
        <p className="text-2xl font-black text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">{stats.losses}</p>
      </div>

      <div className="bg-black border border-zinc-900 p-3 rounded-lg relative overflow-hidden group hover:border-blue-900 transition-colors">
        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Assertividade</p>
        <p className="text-2xl font-black text-white">{stats.assertivity}</p>
      </div>
      
      <div className="bg-black border border-zinc-900 p-3 rounded-lg relative overflow-hidden group hover:border-purple-900 transition-colors">
        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total</p>
        <p className="text-2xl font-black text-zinc-300">{stats.totalSignals}</p>
      </div>
    </div>
  );
};
import React from 'react';
import { BlazeRoll, BlazeColor } from '../types';

interface HistoryStripProps {
  history: BlazeRoll[];
}

export const HistoryStrip: React.FC<HistoryStripProps> = ({ history }) => {
  return (
    <div className="w-full bg-black border border-zinc-900 p-5 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] mt-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-[0.2em] flex items-center gap-2 brand-font">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]"></span>
            Linha do Tempo
          </h3>
      </div>
      
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 px-1">
        {history.map((roll, index) => {
          let bgClass = '';
          let textClass = 'text-white';
          let borderClass = 'border-transparent';
          let shadowClass = '';
          
          if (roll.color === BlazeColor.RED) {
            bgClass = 'bg-red-600';
            shadowClass = 'shadow-[0_0_15px_rgba(220,38,38,0.4)]';
            borderClass = 'border-red-400';
          } else if (roll.color === BlazeColor.BLACK) {
            bgClass = 'bg-zinc-900';
            shadowClass = 'shadow-none';
            borderClass = 'border-zinc-700';
          } else {
            bgClass = 'bg-white';
            textClass = 'text-black font-black';
            shadowClass = 'shadow-[0_0_15px_white]';
            borderClass = 'border-white';
          }
          
          const isLatest = index === 0;

          return (
            <div
              key={roll.id}
              className={`
                relative flex items-center justify-center shrink-0 transition-all duration-300
                ${isLatest ? 'w-10 h-10 text-sm scale-100 z-10 border-2' : 'w-8 h-8 text-xs opacity-60 border'}
                rounded font-bold ${bgClass} ${textClass} ${borderClass} ${shadowClass}
              `}
            >
              {isLatest && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
              )}
              {roll.roll}
            </div>
          );
        })}
      </div>
    </div>
  );
};
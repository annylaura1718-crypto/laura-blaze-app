import React from 'react';
import { Signal, BlazeColor, COLOR_MAP } from '../types';
import { Loader2, Check, X, ShieldAlert } from 'lucide-react';

interface SignalCardProps {
  signal: Signal;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const isWaiting = signal.status === 'waiting';
  const isWin = signal.status === 'win';
  const isLoss = signal.status === 'loss';
  
  let containerClass = "border-zinc-800 bg-black";
  let glowClass = "";
  
  if (signal.color !== null) {
      if (signal.color === BlazeColor.RED) {
          containerClass = "border-red-500 bg-gradient-to-b from-red-950 to-black";
          glowClass = "shadow-[0_0_50px_rgba(220,38,38,0.2)]";
      }
      if (signal.color === BlazeColor.BLACK) {
          containerClass = "border-zinc-500 bg-gradient-to-b from-zinc-900 to-black";
          glowClass = "shadow-[0_0_50px_rgba(255,255,255,0.05)]";
      }
  }

  if (isWin) {
      containerClass = "border-green-500 bg-green-950/20";
      glowClass = "shadow-[0_0_50px_rgba(34,197,94,0.3)]";
  }
  if (isLoss) {
      containerClass = "border-red-600 bg-red-950/30";
      glowClass = "shadow-[0_0_50px_rgba(220,38,38,0.3)]";
  }

  return (
    <div className={`relative w-full max-w-sm mx-auto p-8 rounded-xl border ${containerClass} ${glowClass} transition-all duration-500 mb-8 flex flex-col items-center justify-center text-center`}>
      
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        {isWaiting ? (
            <span className="px-4 py-1 bg-black border border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Loader2 size={10} className="animate-spin" /> IA Analisando
            </span>
        ) : isWin ? (
            <span className="px-6 py-1.5 bg-green-500 text-black text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_green] flex items-center gap-2">
                <Check size={14} strokeWidth={4} /> GREEN SG
            </span>
        ) : isLoss ? (
            <span className="px-6 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_red] flex items-center gap-2">
                <X size={14} strokeWidth={4} /> LOSS
            </span>
        ) : (
            <span className="px-6 py-1.5 bg-white text-black text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_white] animate-pulse">
                SINAL CONFIRMADO
            </span>
        )}
      </div>

      <div className="mt-4 w-full">
        {signal.color === null ? (
            <div className="flex flex-col items-center gap-6 py-8">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-2 border-zinc-800 border-t-red-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldAlert className="text-zinc-700 animate-pulse" size={32} />
                    </div>
                </div>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Aguardando Padrão...</p>
            </div>
        ) : (
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em]">Entrada Identificada</h2>
                
                <div className={`
                    w-28 h-28 rounded-lg shadow-2xl flex items-center justify-center
                    ${COLOR_MAP[signal.color].bg} ${COLOR_MAP[signal.color].border} border-4
                    transition-transform duration-300 transform scale-110
                `}>
                    {signal.color === BlazeColor.WHITE && <span className="text-4xl">⚪</span>}
                </div>
                
                <div className="space-y-1">
                    <p className={`text-3xl font-black uppercase ${COLOR_MAP[signal.color].text.replace('text-slate-900', 'text-white')} drop-shadow-lg brand-font`}>
                        {COLOR_MAP[signal.color].label}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                        Proteger no Branco
                    </p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
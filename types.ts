export enum BlazeColor {
  WHITE = 0,
  RED = 1,
  BLACK = 2
}

export interface BlazeRoll {
  id: string;
  created_at: string;
  color: number;
  roll: number;
  server_seed: string;
}

export interface Signal {
  type: 'buy';
  color: BlazeColor | null; 
  targetRollId?: string; 
  status: 'waiting' | 'active' | 'win' | 'loss' | 'skipped';
  message: string;
  predictedColorName: string;
}

export interface Stats {
  wins: number;
  losses: number;
  winRate: number;
  totalSignals: number;
  assertivity: string;
}

export const COLOR_MAP = {
  [BlazeColor.WHITE]: { bg: 'bg-white', text: 'text-slate-900', label: 'Branco', border: 'border-white' },
  [BlazeColor.RED]: { bg: 'bg-red-600', text: 'text-white', label: 'Vermelho', border: 'border-red-600' },
  [BlazeColor.BLACK]: { bg: 'bg-slate-900', text: 'text-white', label: 'Preto', border: 'border-slate-800' },
};
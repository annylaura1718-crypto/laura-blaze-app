import { BlazeRoll } from '../types';

const BLAZE_API_URL = 'https://blaze.bet.br/api/singleplayer-originals/originals/roulette_games/recent/1';

const PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
];

export const fetchBlazeHistory = async (): Promise<BlazeRoll[]> => {
  const timestamp = Date.now();

  for (const proxy of PROXIES) {
    try {
      let fetchUrl = '';
      if (proxy.includes('allorigins')) {
        fetchUrl = `${proxy}${encodeURIComponent(BLAZE_API_URL)}&t=${timestamp}`;
      } else {
        fetchUrl = `${proxy}${BLAZE_API_URL}?t=${timestamp}`;
      }

      const response = await fetch(fetchUrl);
      
      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data as BlazeRoll[];
      }
    } catch (error) {
      continue;
    }
  }
  return [];
};
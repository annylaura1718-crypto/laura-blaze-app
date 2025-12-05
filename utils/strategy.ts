import { BlazeRoll, BlazeColor } from '../types';

export const calculateNextSignal = (history: BlazeRoll[]): BlazeColor | null => {
  if (history.length < 2) return null;

  const latestRoll = history[0];
  const latestNumber = latestRoll.roll;

  let previousIndex = -1;

  for (let i = 1; i < history.length - 1; i++) {
    if (history[i].roll === latestNumber) {
      previousIndex = i;
      break;
    }
  }

  if (previousIndex !== -1) {
    const rollAfterPrevious = history[previousIndex - 1];
    if (rollAfterPrevious.color === BlazeColor.WHITE) {
      return BlazeColor.RED; 
    }
    return rollAfterPrevious.color;
  }

  return latestRoll.color === BlazeColor.RED ? BlazeColor.BLACK : BlazeColor.RED;
};
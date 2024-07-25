import type { TriggerFrequency } from '../card-effect';

export const nTimesPerTurn = (n: number): TriggerFrequency => {
  return {
    type: 'n_per_turn',
    params: {
      count: n
    }
  };
};

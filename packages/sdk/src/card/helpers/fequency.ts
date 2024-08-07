import type { TriggerFrequency } from '../card-action-triggers';

export const nTimesPerTurn = (n: number): TriggerFrequency => {
  return {
    type: 'n_per_turn',
    params: {
      count: n
    }
  };
};

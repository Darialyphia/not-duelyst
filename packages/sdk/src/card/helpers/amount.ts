import type { Amount } from '../card-effect';

export const fixedAmount = (value: number): Amount<Record<string, never>> => {
  return { type: 'fixed', params: { value } };
};

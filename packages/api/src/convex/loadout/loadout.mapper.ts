import type { Id } from '../_generated/dataModel';
import type { Loadout } from './loadout.entity';

export type LoadoutDto = {
  _id: Id<'loadouts'>;
  name: string;
  cards: Array<{
    id: string;
    pedestalId: string;
  }>;
};

export const toLoadoutDto = (loadout: Loadout): LoadoutDto => {
  return {
    _id: loadout._id,
    name: loadout.name,
    cards: loadout.cards.map(card => ({ id: card.id, pedestalId: card.pedestalId }))
  };
};

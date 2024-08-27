import type { Id } from '../_generated/dataModel';
import type { GameFormat } from '../formats/format.entity';
import type { Loadout } from './loadout.entity';

export type LoadoutDto = {
  _id: Id<'loadouts'>;
  name: string;
  cards: Array<{
    id: string;
    pedestalId: string;
    cardBackId: string;
  }>;
  format: {
    _id: Id<'formats'>;
    name: string;
  };
};

export const toLoadoutDto = (loadout: Loadout & { format: GameFormat }): LoadoutDto => {
  return {
    _id: loadout._id,
    name: loadout.name,
    cards: loadout.cards.map(card => ({
      id: card.id,
      pedestalId: card.pedestalId,
      cardBackId: card.cardBackId
    })),
    format: {
      _id: loadout.format._id,
      name: loadout.format.name
    }
  };
};

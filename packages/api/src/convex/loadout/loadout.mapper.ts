import { defaultMap, GameSession, type GenericSerializedBlueprint } from '@game/sdk';
import type { Id } from '../_generated/dataModel';
import type { GameFormat } from '../formats/format.entity';
import type { Loadout } from './loadout.entity';
import type { PartialBy } from '@game/shared';
import { parse } from 'zipson';

export type LoadoutDto = {
  _id: Id<'loadouts'>;
  name: string;
  cards: Array<{
    id: string;
    pedestalId: string;
    cardBackId: string;
  }>;
  format: {
    _id?: Id<'formats'>;
    name: string;
  };
  isValid: boolean;
};

export const toLoadoutDto = (
  loadout: Loadout & { format: PartialBy<GameFormat, '_id' | '_creationTime'> }
): LoadoutDto => {
  const formatCards = parse(loadout.format!.cards) as Record<
    string,
    GenericSerializedBlueprint
  >;
  const violations = GameSession.getLoadoutViolations(
    loadout.cards.map(c => ({ ...c, blueprintId: c.id })),
    {
      config: loadout.format!.config,
      cards: formatCards,
      map: loadout.format.map ? parse(loadout.format.map) : defaultMap
    }
  );

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
    },
    isValid: !violations.length
  };
};

export type GameLoadoutDto = {
  _id: Id<'loadouts'>;
  name: string;
  cards: Array<{
    id: string;
    pedestalId: string;
    cardBackId: string;
  }>;
};

export const toGameLoadoutDto = (loadout: Loadout): GameLoadoutDto => {
  return {
    _id: loadout._id,
    name: loadout.name,
    cards: loadout.cards.map(card => ({
      id: card.id,
      pedestalId: card.pedestalId,
      cardBackId: card.cardBackId
    }))
  };
};

import { keyBy } from 'lodash-es';
import type { CardBlueprintId } from './card';
import type { CardBlueprint } from './card-blueprint';
import { f1General } from './cards/faction_1/general';
import { f1Elemental } from './cards/faction_1/elemental';
import { f1Djinn } from './cards/faction_1/djinn';
import { f1Dancer } from './cards/faction_1/dancer';
import { f1Kirin } from './cards/faction_1/kirin';
import { f1Ranged } from './cards/faction_1/ranged';
import { neutralTank } from './cards/neutral/tank';

const allCards: CardBlueprint[] = [
  f1General,
  f1Elemental,
  f1Djinn,
  f1Dancer,
  f1Kirin,
  f1Ranged,

  neutralTank
];

export const CARDS: Record<CardBlueprintId, CardBlueprint> = keyBy(allCards, 'id');

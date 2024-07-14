import { keyBy } from 'lodash-es';
import type { CardBlueprintId } from './card';
import type { CardBlueprint } from './card-blueprint';
import { f1General } from './cards/faction_1/general';
import { f2General } from './cards/faction_2/general';
import { parseSerializeBlueprint } from './card-parser';
import { neutralHealingMystic } from './cards/neutral/neutral_healing_mystic';
import { neutralRiftWalker } from './cards/neutral/neutral_rift_walker';
import { f1TrueStrike } from './cards/faction_1/true_strike';
import { f1SunstoneBracers } from './cards/faction_1/sunstone_bracers';

const allCards: CardBlueprint[] = [
  f1General,
  f2General,
  parseSerializeBlueprint(f1TrueStrike),
  parseSerializeBlueprint(neutralHealingMystic),
  parseSerializeBlueprint(neutralRiftWalker),
  parseSerializeBlueprint(f1SunstoneBracers)
];

export const CARDS: Record<CardBlueprintId, CardBlueprint> = keyBy(allCards, 'id');

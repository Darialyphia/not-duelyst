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
import { f1WindbladeAdept } from './cards/faction_1/windblade_adept';
import { neutralPrimusShieldMaster } from './cards/neutral/neutral_primus-shieldmaster';
import { f1SilverguardKnight } from './cards/faction_1/silverguard_knight';

const allCards: CardBlueprint[] = [
  f1General,
  f2General,
  parseSerializeBlueprint(f1TrueStrike),
  parseSerializeBlueprint(neutralHealingMystic),
  parseSerializeBlueprint(neutralRiftWalker),
  parseSerializeBlueprint(f1SunstoneBracers),
  parseSerializeBlueprint(f1SilverguardKnight),
  parseSerializeBlueprint(f1WindbladeAdept),
  parseSerializeBlueprint(neutralPrimusShieldMaster)
];

export const CARDS: Record<CardBlueprintId, CardBlueprint> = keyBy(allCards, 'id');

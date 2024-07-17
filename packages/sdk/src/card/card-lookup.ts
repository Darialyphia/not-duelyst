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
import { f1AzuriteLion } from './cards/faction_1/azurite_lion';
import { f1Martyrdom } from './cards/faction_1/martyrdom';
import { f1LionheartBlessing } from './cards/faction_1/lionheart_blessing';
import { f1IroncliffeGuardian } from './cards/faction_1/ironcliffe_guardian';

const allCards: CardBlueprint[] = [
  f1General,
  f2General,
  parseSerializeBlueprint(f1IroncliffeGuardian),
  parseSerializeBlueprint(f1TrueStrike),
  parseSerializeBlueprint(f1LionheartBlessing),
  parseSerializeBlueprint(f1Martyrdom),
  parseSerializeBlueprint(neutralHealingMystic),
  parseSerializeBlueprint(neutralRiftWalker),
  parseSerializeBlueprint(f1SunstoneBracers),
  parseSerializeBlueprint(f1SilverguardKnight),
  parseSerializeBlueprint(f1WindbladeAdept),
  parseSerializeBlueprint(f1AzuriteLion),
  parseSerializeBlueprint(neutralPrimusShieldMaster)
];

export const CARDS: Record<CardBlueprintId, CardBlueprint> = keyBy(allCards, 'id');

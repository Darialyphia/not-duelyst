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
import { f1SilverguardSquire } from './cards/faction_1/silverguard_squire';
import { f1ArclyteSentinel } from './cards/faction_1/arclyte_sentinel';
import { f1Lightchaser } from './cards/faction_1/lightchaser';
import { f1Sunriser } from './cards/faction_1/sunriser';
import { f1SuntideMaiden } from './cards/faction_1/suntide_mainden';
import { f1LysianBrawler } from './cards/faction_1/lysian_brawler';
import { f1SecondSun } from './cards/faction_1/second_sun';
import { f1Tempest } from './cards/faction_1/tempest';
import { f1HolyImmolation } from './cards/faction_1/holy_immolation';
import { f1DivineBond } from './cards/faction_1/divine_bond';
import { f1SundropElixir } from './cards/faction_1/sundrop_elixir';
import { f1LastingJudgement } from './cards/faction_1/lasting_judgment';

const allCards: CardBlueprint[] = [
  f1General,
  f2General,
  parseSerializeBlueprint(f1IroncliffeGuardian),
  parseSerializeBlueprint(f1TrueStrike),
  parseSerializeBlueprint(f1LionheartBlessing),
  parseSerializeBlueprint(f1Martyrdom),
  parseSerializeBlueprint(f1SunstoneBracers),
  parseSerializeBlueprint(f1SilverguardKnight),
  parseSerializeBlueprint(f1WindbladeAdept),
  parseSerializeBlueprint(f1AzuriteLion),
  parseSerializeBlueprint(f1SilverguardSquire),
  parseSerializeBlueprint(f1ArclyteSentinel),
  parseSerializeBlueprint(f1Lightchaser),
  parseSerializeBlueprint(f1Sunriser),
  parseSerializeBlueprint(f1LysianBrawler),
  parseSerializeBlueprint(f1SecondSun),
  parseSerializeBlueprint(f1Tempest),
  parseSerializeBlueprint(f1HolyImmolation),
  parseSerializeBlueprint(f1DivineBond),
  parseSerializeBlueprint(f1SundropElixir),
  parseSerializeBlueprint(f1SuntideMaiden),
  parseSerializeBlueprint(f1LastingJudgement),
  parseSerializeBlueprint(neutralHealingMystic),
  parseSerializeBlueprint(neutralRiftWalker),
  parseSerializeBlueprint(neutralPrimusShieldMaster)
];

export const CARDS: Record<CardBlueprintId, CardBlueprint> = keyBy(allCards, 'id');

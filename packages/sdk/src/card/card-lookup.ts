import { keyBy } from 'lodash-es';
import type { CardBlueprintId } from './card';
import type { CardBlueprint } from './card-blueprint';
import { f1General } from './cards/faction_1/general';
import { f1Elemental } from './cards/faction_1/elemental';
import { f1Djinn } from './cards/faction_1/djinn';
import { f1Dancer } from './cards/faction_1/dancer';
import { f1Structure } from './cards/faction_1/structure';
import { neutralTank } from './cards/neutral/tank';
import { f1Mage } from './cards/faction_1/mage';
import { tutorialGeneral } from './cards/neutral/tutorial_general';
import { tutorialCat } from './cards/neutral/tutorial_cat';
import { f1TutorialGeneral } from './cards/faction_1/tutorial_general';
import { f2TutorialBigDude } from './cards/faction_2/tutorial_big_dude';
import { f1Naga } from './cards/faction_1/naga';
import { f1KirinSummoner } from './cards/faction_1/kirin-summoner';
import { f1Kirin } from './cards/faction_1/kirin';

const allCards: CardBlueprint[] = [
  f1General,
  f1Elemental,
  f1Djinn,
  f1Dancer,
  f1KirinSummoner,
  f1Kirin,
  f1Structure,
  f1Mage,
  f1Naga,

  neutralTank,

  f1TutorialGeneral,
  f2TutorialBigDude,
  tutorialGeneral,
  tutorialCat
];

export const CARDS: Record<CardBlueprintId, CardBlueprint> = keyBy(allCards, 'id');

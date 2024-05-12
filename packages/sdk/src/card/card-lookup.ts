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
import { f1Mage } from './cards/faction_1/mage';
import { tutorialGeneral } from './cards/neutral/tutorial_general';
import { tutorialCat } from './cards/neutral/tutorial_cat';
import { f1TutorialGeneral } from './cards/faction_1/tutorial_general';
import { f2TutorialBigDude } from './cards/faction_2/tutorial_big_dude';
import { f1Naga } from './cards/faction_1/naga';

const allCards: CardBlueprint[] = [
  f1General,
  f1TutorialGeneral,
  f1Elemental,
  f1Djinn,
  f1Dancer,
  f1Kirin,
  f1Ranged,
  f1Mage,
  f1Naga,

  f2TutorialBigDude,

  neutralTank,

  tutorialGeneral,
  tutorialCat
];

export const CARDS: Record<CardBlueprintId, CardBlueprint> = keyBy(allCards, 'id');

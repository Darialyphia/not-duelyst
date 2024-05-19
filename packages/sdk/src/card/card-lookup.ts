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
import { f1Simurgh } from './cards/faction_1/simurgh';
import { f1Wisp } from './cards/faction_1/wisp';
import { f1ElementalLord } from './cards/faction_1/elemental-lord';
import { neutralAirElemental } from './cards/neutral/air-elemental';
import { neutralFireElemental } from './cards/neutral/fire-elemental';
import { neutralEarthElemental } from './cards/neutral/earth-elemental';
import { neutralWaterElemental } from './cards/neutral/water-elemental';
import { f1ElementalConfluence } from './cards/faction_1/elemental-confluence';
import { f2Tormentor } from './cards/faction_2/tormentor';
import { f2DoomSayer } from './cards/faction_2/doom-sayer';
import { f2DamnedSouls } from './cards/faction_2/damned-souls';
import { f2MoltenFist } from './cards/faction_2/molten-fist';
import { f2Ravager } from './cards/faction_2/ravager';
import { f2General } from './cards/faction_2/general';
import { f2Imp } from './cards/faction_2/imp';
import { f2Overseer } from './cards/faction_2/overseer';

const allCards: CardBlueprint[] = [
  f1General,
  f1Wisp,
  f1Elemental,
  f1Djinn,
  f1Dancer,
  f1KirinSummoner,
  f1Kirin,
  f1Structure,
  f1Mage,
  f1Naga,
  f1ElementalLord,
  f1ElementalConfluence,
  f1Simurgh,

  f2General,
  f2Imp,
  f2DoomSayer,
  f2Tormentor,
  f2DamnedSouls,
  f2MoltenFist,
  f2Ravager,
  f2Overseer,

  neutralTank,
  neutralAirElemental,
  neutralFireElemental,
  neutralEarthElemental,
  neutralWaterElemental,

  f1TutorialGeneral,
  f2TutorialBigDude,
  tutorialGeneral,
  tutorialCat
];

export const CARDS: Record<CardBlueprintId, CardBlueprint> = keyBy(allCards, 'id');

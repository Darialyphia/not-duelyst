import { keyBy } from 'lodash-es';
import type { CardBlueprintId } from './card';
import type { CardBlueprint } from './card-blueprint';
import { f1General } from './cards/faction_1/general';
import { f2General } from './cards/faction_2/general';

const allCards: CardBlueprint[] = [f1General, f2General];

export const CARDS: Record<CardBlueprintId, CardBlueprint> = keyBy(allCards, 'id');

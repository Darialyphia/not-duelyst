import type { Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
};

export const KEYWORDS = {
  EXHAUSTED: {
    id: 'exhausted',
    name: 'Exhausted',
    description: 'This unit has already acted this turn.'
  },
  RUSH: {
    id: 'rush',
    name: 'Rush',
    description: 'Can move and attack immediately.'
  },
  OPENING_GAMBIT: {
    id: 'openiong_gambit',
    name: 'Opening Gambit',
    description: 'Triggers an effect when summoned from your action bar.'
  },
  DYING_WISH: {
    id: 'dying_wish',
    name: 'Dying With',
    description: 'Triggers an effect when destroyed.'
  },
  RANGED: {
    id: 'ranged',
    name: 'Ranged',
    description: 'Can attack any enemy, regardeless of distance.'
  },
  EPHEMERAL: {
    id: 'ephemeral',
    name: 'Ephemeral',
    description: 'Disappears at the end of the turn it is summoned.'
  },
  GATEWAY: {
    id: 'gateway',
    name: 'Gateway',
    description: 'At the start of your turn, summon a Wind Dervish on a nearby space.'
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];

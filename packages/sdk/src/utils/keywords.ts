import type { Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
};

export const KEYWORDS = {
  RUSH: {
    id: 'rush',
    name: 'Rush',
    description: 'This unit can move and use abilities the turn it is summoned.'
  },
  SECOND_WIND: {
    id: 'second_wind',
    name: 'Second wind',
    description: "This skill doesn't exhaust its caster."
  },
  BURN: {
    id: 'burn',
    name: 'Burn(x)',
    description: 'This unit X receives damage at the beginning of its turn.'
  },
  REGENERATION: {
    id: 'regeneration',
    name: 'Regeneration(X)',
    description: 'This unit recovers X hp at the beginning of its turn.'
  },
  TOUGH: {
    id: 'tough',
    name: 'Tough',
    description: 'This unit takes 1 less damage from all sources (min. 1).'
  },
  VULNERABLE: {
    id: 'vulnerable',
    name: 'Vulnerable',
    description: 'This unit takes 1 more damage from all sources.'
  },
  TAUNT: {
    id: 'taunt',
    name: 'Taunt',
    description: 'Nearby enemies cannot move and must target this unit.'
  },
  FROZEN: {
    id: 'frozen',
    name: 'Frozen',
    description:
      'This unit cannot move, use abilities, or retaliate. Taking damage breaks the freeze.'
  },
  ROOTED: {
    id: 'rooted',
    name: 'Rooted',
    description: 'This unit cannot move.'
  },
  SILENCED: {
    id: 'silenced',
    name: 'Silenced',
    description: 'This unit cannot cast abilities.'
  },
  DISARMED: {
    id: 'disarmed',
    name: 'Disarmed',
    description: 'This unit cannot attack.'
  },
  THORNS: {
    id: 'thorns',
    name: 'Thorns(x)',
    description: 'Enemies unit dealing damage to this unit take X damage.'
  },
  SUMMON: {
    id: 'summon',
    name: 'Summon',
    description: 'Triggers when the unit enters the battlefield.'
  },
  LAST_WILL: {
    id: 'last_will',
    name: 'Last will',
    description: 'Triggers when the unit is destroyed.'
  },
  PLUNDER: {
    id: 'plunder',
    name: 'Plunder(x)',
    description: 'Gain X gold when the condition is met.'
  },
  VIGILANT: {
    id: 'vigilant',
    name: 'Vigilant',
    description: 'This unit does not exhaust when retaliating.'
  },
  FEARSOME: {
    id: 'fearsomem',
    name: 'Fearsome',
    description: 'Prevents targeted units from retaliating.'
  },
  BARRIER: {
    id: 'barrier',
    name: 'Barrier',
    description: 'Prevents the next source of damage dealt to this unit.'
  },
  LONE_WOLF: {
    id: 'lone_wolf',
    name: 'Lone wolf',
    description: 'Triggers when this unit has no nearby allies.'
  },
  FERVOR: {
    id: 'fervor',
    name: 'Fervor',
    description: 'Triggers when this unit is nearby its general.'
  },
  AURA: {
    id: 'aura',
    name: 'Aura',
    description: 'Apply the effect to all nearby units.'
  },
  SLAY: {
    id: 'slay',
    name: 'Slay',
    description: 'Triggers when this unit destroys another one.'
  },
  DEATHWATCH: {
    id: 'deathwatch',
    name: 'Deathwatch',
    description: 'Triggers whenever a unit is destroyed.'
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];

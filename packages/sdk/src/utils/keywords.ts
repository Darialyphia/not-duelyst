import type { Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  spriteId?: string;
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
  CHANNELING: {
    id: 'channeling',
    name: 'Channeling',
    description:
      'After using this ability, its caster cannot move until the end of the turn.'
  },
  CURSE: {
    id: 'curse',
    name: 'Curse',
    description: 'Remove all positive modifiers from a unit'
  },
  CLEANSE: {
    id: 'cleanse',
    name: 'Clense',
    description: 'Remove all negative modifiers from a unit'
  },
  BURN: {
    id: 'burn',
    name: 'Burn',
    description: 'This unit 1 receives damage at the beginning of its turn.',
    spriteId: 'burn'
  },
  REGENERATION: {
    id: 'regeneration',
    name: 'Regeneration',
    description: 'This unit recovers 1 hp at the beginning of its turn.'
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
  TAUNTED: {
    id: 'taunted',
    name: 'Taunted',
    description: 'This unit cannot move or cast abilities, and must attack the taunter.',
    spriteId: 'taunt'
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
    name: 'Thorns',
    description: 'Enemies unit dealing damage to this unit take 1 damage.'
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
    name: 'Plunder',
    description: 'Gain 1 gold when the condition is met.'
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
  },
  FURY: {
    id: 'fury',
    name: 'Fury',
    description: 'Can attack twice per turn'
  },
  CELERITY: {
    id: 'celerity',
    name: 'Celerity',
    description: 'Can move twice per turn'
  },
  FLYING: {
    id: 'flying',
    name: 'Flying',
    description: 'can walk over water'
  },
  NIMBLE: {
    id: 'nimble',
    name: 'Nimble',
    description: 'This unit can walk through other units.',
    spriteId: 'nimble'
  },
  RANGED: {
    id: 'ranged',
    name: 'Ranged(x)',
    description: 'This unit can attack from X tiles away.'
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];

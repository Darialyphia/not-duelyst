import type { Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  spriteId?: string;
  aliases: (string | RegExp)[];
};

export const KEYWORDS = {
  AURA: {
    id: 'aura',
    name: 'Aura',
    description: 'Apply the effect to all nearby units.',
    aliases: []
  },
  BARRIER: {
    id: 'barrier',
    name: 'Barrier',
    description: 'Prevents the next source of damage dealt to this unit.',
    spriteId: 'barrier',
    aliases: []
  },
  BURN: {
    id: 'burn',
    name: 'Burn(x)',
    description: 'This unit x receives damage at the beginning of its turn.',
    spriteId: 'burn',
    aliases: [/burn\([0-9]+\)/]
  },
  CALL_TO_ARMS: {
    id: 'call_to_arms',
    name: 'Call to Arms',
    description: 'Triggers when the unit enters the battlefield.',
    aliases: []
  },
  CELERITY: {
    id: 'celerity',
    name: 'Celerity',
    description: 'Can move twice per turn.',
    aliases: []
  },
  CHANNELING: {
    id: 'channeling',
    name: 'Channeling',
    description:
      'After using this ability, its caster cannot move until the end of the turn.',
    aliases: []
  },
  CLEANSE: {
    id: 'cleanse',
    name: 'Cleanse',
    description: 'Remove all negative effects from a unit.',
    aliases: []
  },
  DEATHWATCH: {
    id: 'deathwatch',
    name: 'Deathwatch',
    description: 'Triggers whenever a unit is destroyed.',
    aliases: []
  },
  DISARMED: {
    id: 'disarmed',
    name: 'Disarmed',
    description: 'This unit cannot attack.',
    aliases: ['disarm']
  },
  FEARSOME: {
    id: 'fearsomem',
    name: 'Fearsome',
    description: 'Prevents targeted units from retaliating.',
    aliases: []
  },
  FERVOR: {
    id: 'fervor',
    name: 'Fervor',
    description: 'Triggers when this unit is nearby its general.',
    aliases: []
  },
  FLYING: {
    id: 'flying',
    name: 'Flying',
    description: 'can walk over water and climb terrain.',
    aliases: []
  },
  FROZEN: {
    id: 'frozen',
    name: 'Frozen',
    description:
      'This unit cannot move, use abilities, or retaliate. Taking damage breaks the freeze.',
    aliases: ['freeze']
  },
  FURY: {
    id: 'fury',
    name: 'Fury',
    description: 'Can attack twice per turn.',
    aliases: [],
    spriteId: 'fury'
  },
  LAST_WILL: {
    id: 'last_will',
    name: 'Last will',
    description: 'Triggers when the unit is destroyed.',
    aliases: []
  },
  LONE_WOLF: {
    id: 'lone_wolf',
    name: 'Lone wolf',
    description: 'Triggers when this unit has no nearby allies.',
    aliases: []
  },
  NIMBLE: {
    id: 'nimble',
    name: 'Nimble',
    description: 'This unit can walk through other units.',
    spriteId: 'nimble',
    aliases: []
  },
  PLUNDER: {
    id: 'plunder',
    name: 'Plunder',
    description: 'Gain 1 gold when the condition is met.',
    aliases: []
  },
  PURGE: {
    id: 'purge',
    name: 'Purge',
    description: 'Remove all positive effects from a unit.',
    aliases: []
  },
  RANGED: {
    id: 'ranged',
    name: 'Ranged(x)',
    description: 'This unit attack range is increased by X.',
    aliases: [/ranged\([0-9]+\)/]
  },
  REGENERATION: {
    id: 'regeneration',
    name: 'Regeneration(x)',
    description: 'This unit recovers x hp at the beginning of its turn.',
    aliases: [/regeneration\([0-9]+\)/]
  },
  ROOTED: {
    id: 'rooted',
    name: 'Rooted',
    description: 'This unit cannot move.',
    aliases: ['root']
  },
  RUSH: {
    id: 'rush',
    name: 'Rush',
    description: 'This unit can move and use abilities the turn it is summoned.',
    aliases: []
  },
  SECOND_WIND: {
    id: 'second_wind',
    name: 'Second wind',
    description: "This skill doesn't exhaust its caster.",
    aliases: []
  },
  SILENCED: {
    id: 'silenced',
    name: 'Silenced',
    description: 'This unit cannot cast abilities.',
    aliases: ['silence'],
    spriteId: 'silenced'
  },
  SLAY: {
    id: 'slay',
    name: 'Slay',
    description: 'Triggers when this unit destroys another one.',
    aliases: []
  },
  STRUCTURE: {
    id: 'structure',
    name: 'Structure',
    aliases: [],
    description: 'Cannot move, attack, retaliate or gain attack.'
  },
  SURGE: {
    id: 'surge',
    name: 'Surge(x)',
    description: 'Deal x more damage with abilities.',
    aliases: [/surge\([0-9]+\)/]
  },
  TAUNTED: {
    id: 'taunted',
    name: 'Taunted',
    description: 'This unit cannot move or cast abilities, and must attack the taunter.',
    spriteId: 'taunt',
    aliases: ['taunt']
  },
  THORNS: {
    id: 'thorns',
    name: 'Thorns(x)',
    description: 'Enemies unit dealing damage to this unit take x damage.',
    aliases: [/thorns\([0-9]+\)/]
  },
  TOUGH: {
    id: 'tough',
    name: 'Tough(x)',
    spriteId: 'tough',
    description: 'This unit takes x less damage from all sources (min. 1).',
    aliases: []
  },
  VIGILANT: {
    id: 'vigilant',
    name: 'Vigilant',
    description: 'This unit does not exhaust when retaliating.',
    aliases: []
  },
  VULNERABLE: {
    id: 'vulnerable',
    name: 'Vulnerable(x)',
    description: 'This unit takes x more damage from all sources.',
    spriteId: 'vulnerable',
    aliases: [/vulnerable\([0-9]+\)/]
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];

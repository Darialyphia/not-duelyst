import type { Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  spriteId?: string;
  aliases: (string | RegExp)[];
};

export const KEYWORDS = {
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
  CHANNELING: {
    id: 'channeling',
    name: 'Channeling',
    description:
      'After using this ability, its caster cannot move until the end of the turn.',
    aliases: []
  },
  PURGE: {
    id: 'purge',
    name: 'Purge',
    description: 'Remove all positive effects from a unit.',
    aliases: []
  },
  CLEANSE: {
    id: 'cleanse',
    name: 'Cleanse',
    description: 'Remove all negative effects from a unit.',
    aliases: []
  },
  BURN: {
    id: 'burn',
    name: 'Burn',
    description:
      'This unit 1 receives damage at the beginning of its turn. Can be stacked.',
    spriteId: 'burn',
    aliases: []
  },
  REGENERATION: {
    id: 'regeneration',
    name: 'Regeneration',
    description: 'This unit recovers 1 hp at the beginning of its turn. Can be stacked.',
    aliases: []
  },
  TOUGH: {
    id: 'tough',
    name: 'Tough',
    description:
      'This unit takes 1 less damage from all sources (min. 1). Can be stacked.',
    aliases: []
  },
  VULNERABLE: {
    id: 'vulnerable',
    name: 'Vulnerable',
    description: 'This unit takes 1 more damage from all sources. Can be stacked.',
    aliases: []
  },
  TAUNTED: {
    id: 'taunted',
    name: 'Taunted',
    description: 'This unit cannot move or cast abilities, and must attack the taunter.',
    spriteId: 'taunt',
    aliases: ['taunt']
  },
  FROZEN: {
    id: 'frozen',
    name: 'Frozen',
    description:
      'This unit cannot move, use abilities, or retaliate. Taking damage breaks the freeze.',
    aliases: ['freeze']
  },
  ROOTED: {
    id: 'rooted',
    name: 'Rooted',
    description: 'This unit cannot move.',
    aliases: ['root']
  },
  SILENCED: {
    id: 'silenced',
    name: 'Silenced',
    description: 'This unit cannot cast abilities.',
    aliases: ['silence']
  },
  DISARMED: {
    id: 'disarmed',
    name: 'Disarmed',
    description: 'This unit cannot attack.',
    aliases: ['disarm']
  },
  THORNS: {
    id: 'thorns',
    name: 'Thorns',
    description:
      'Enemies unit dealing damage to this unit take 1 damage. Can be stacked.',
    aliases: []
  },
  CALL_TO_ARMS: {
    id: 'call_to_arms',
    name: 'Call to Arms',
    description: 'Triggers when the unit enters the battlefield.',
    aliases: []
  },
  LAST_WILL: {
    id: 'last_will',
    name: 'Last will',
    description: 'Triggers when the unit is destroyed.',
    aliases: []
  },
  PLUNDER: {
    id: 'plunder',
    name: 'Plunder',
    description: 'Gain 1 gold when the condition is met.',
    aliases: []
  },
  VIGILANT: {
    id: 'vigilant',
    name: 'Vigilant',
    description: 'This unit does not exhaust when retaliating.',
    aliases: []
  },
  FEARSOME: {
    id: 'fearsomem',
    name: 'Fearsome',
    description: 'Prevents targeted units from retaliating.',
    aliases: []
  },
  BARRIER: {
    id: 'barrier',
    name: 'Barrier',
    description: 'Prevents the next source of damage dealt to this unit.',
    aliases: []
  },
  LONE_WOLF: {
    id: 'lone_wolf',
    name: 'Lone wolf',
    description: 'Triggers when this unit has no nearby allies.',
    aliases: []
  },
  FERVOR: {
    id: 'fervor',
    name: 'Fervor',
    description: 'Triggers when this unit is nearby its general.',
    aliases: []
  },
  AURA: {
    id: 'aura',
    name: 'Aura',
    description: 'Apply the effect to all nearby units.',
    aliases: []
  },
  SLAY: {
    id: 'slay',
    name: 'Slay',
    description: 'Triggers when this unit destroys another one.',
    aliases: []
  },
  DEATHWATCH: {
    id: 'deathwatch',
    name: 'Deathwatch',
    description: 'Triggers whenever a unit is destroyed.',
    aliases: []
  },
  FURY: {
    id: 'fury',
    name: 'Fury',
    description: 'Can attack twice per turn.',
    aliases: [],
    spriteId: 'fury'
  },
  CELERITY: {
    id: 'celerity',
    name: 'Celerity',
    description: 'Can move twice per turn.',
    aliases: []
  },
  FLYING: {
    id: 'flying',
    name: 'Flying',
    description: 'can walk over water and climb terrain.',
    aliases: []
  },
  NIMBLE: {
    id: 'nimble',
    name: 'Nimble',
    description: 'This unit can walk through other units.',
    spriteId: 'nimble',
    aliases: []
  },
  RANGED: {
    id: 'ranged',
    name: 'Ranged(x)',
    description: 'This unit attack range is increased by X.',
    aliases: [/ranged\([0-9]+\)/]
  },
  STRUCTURE: {
    id: 'structure',
    name: 'Structure',
    aliases: [],
    description: 'Cannot move, attack, retaliate or gain attack.'
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];

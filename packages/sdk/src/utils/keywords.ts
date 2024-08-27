import type { Values } from '@game/shared';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import { isWithinCells } from './targeting';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  spriteId?: string;
  shouldDisplaySprite?: (session: GameSession, entity: Entity) => boolean;
  aliases: (string | RegExp)[];
};

export const KEYWORDS = {
  AIRDROP: {
    id: 'airdrop',
    name: 'Airdrop',
    description: 'Can be summoned anywhere.',
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
  BACKSTAB: {
    id: 'backstab',
    name: 'Backstab',
    description:
      'When attacking from behind, this deals extra damaged and cannot be counterattacked.',
    aliases: []
  },
  TOUGH: {
    id: 'tough',
    name: 'Tough',
    spriteId: 'tough',
    description: 'This unit takes less damage from all sources (minimum. 1).',
    aliases: [/though\([0-9]+\)/, 'tough']
  },
  VULNERABLE: {
    id: 'vulnerable',
    name: 'Vulnerable',
    description: 'This unit takes more damage from all sources.',
    spriteId: 'vulnerable',
    aliases: [/vulnerable\([0-9]+\)/]
  },
  OPENING_GAMBIT: {
    id: 'opening_gambit',
    name: 'Opening Gambit',
    description: 'Triggers when the unit enters the battlefield.',
    aliases: []
  },
  ESSENCE: {
    id: 'essence',
    name: 'Essence',
    description:
      "If you don't have enough gold, you can play this minion as a spell by paying its essence cost instead.",
    aliases: [/essence\([0-9]+\)/]
  },
  CELERITY: {
    id: 'celerity',
    name: 'Celerity',
    description: 'Can activate twice per turn.',
    aliases: [],
    spriteId: 'celerity'
  },
  DEATHWATCH: {
    id: 'deathwatch',
    name: 'Deathwatch',
    description: 'Triggers effect whenever a unit is destroyed.',
    aliases: []
  },
  DISPEL: {
    id: 'dispel',
    name: 'Dispel',
    description: 'Nullifies all abilities and enchantments previously added.',
    aliases: []
  },
  ADAPT: {
    id: 'adapt',
    name: 'Adapt',
    description: 'When you play this card, choose one of multiple possible effects.',
    aliases: []
  },
  CLEANSE: {
    id: 'cleanse',
    name: 'Cleanse',
    description: 'Remove enchantments previously added from enemy sources.',
    aliases: []
  },
  FEARSOME: {
    id: 'fearsome',
    name: 'Fearsome',
    description: "When this is unit attacks a minion, the target doesn't counterattack.",
    aliases: [],
    spriteId: 'fearsome'
  },
  ZEAL: {
    id: 'zeal',
    name: 'Zeal',
    description: 'Triggers an effect when nearby its general.',
    spriteId: 'zeal',
    aliases: [],
    shouldDisplaySprite(session, entity) {
      return isWithinCells(entity.position, entity.player.general.position, 1);
    }
  },
  ELUSIVE: {
    id: 'elusive',
    name: 'Elusive',
    description:
      'When this gets attacked, this teleports behnd the attacker if possible instead of counterattacking. If it does, this unit takes no damage from the attack.',
    aliases: []
  },
  FLYING: {
    id: 'flying',
    name: 'Flying',
    description: 'can move anywhere on the battlefield.',
    aliases: []
  },
  FRENZY: {
    id: 'frenzy',
    name: 'Frenzy',
    description:
      'When attacking a nearby enemy, deal its attack damage to other nearby enemies.',
    aliases: ['frenzy'],
    spriteId: 'fury'
  },
  FROZEN: {
    id: 'frozen',
    name: 'Frozen',
    description: 'This unit skips it next turn.',
    aliases: ['freeze'],
    spriteId: 'frozen'
  },
  DYING_WISH: {
    id: 'dying_wish',
    name: 'Dying Wish',
    description: 'Triggers when the unit is destroyed.',
    aliases: []
  },
  LONE_WOLF: {
    id: 'lone_wolf',
    name: 'Lone wolf',
    description: 'Triggers when this unit has no nearby allies.',
    aliases: []
  },
  PLUNDER: {
    id: 'plunder',
    name: 'Plunder',
    description: 'Gain 1 gold when this deals damage to another unit.',
    aliases: []
  },
  RANGED: {
    id: 'ranged',
    name: 'Ranged',
    description: 'Can attack any enemy regardless of distance.',
    aliases: []
  },
  REGENERATION: {
    id: 'regeneration',
    name: 'Regeneration(x)',
    description: 'This unit recovers x hp at the beginning of its turn.',
    spriteId: 'regeneration',
    aliases: [/regeneration\([0-9]+\)/]
  },
  ROOTED: {
    id: 'rooted',
    name: 'Rooted',
    description: 'This unit cannot move.',
    aliases: ['root'],
    spriteId: 'root'
  },
  RUSH: {
    id: 'rush',
    name: 'Rush',
    description: 'This unit activates the turn it is summoned.',
    aliases: []
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
  PROVOKE: {
    id: 'provoke',
    name: 'Provoke',
    description:
      'Stops enemy minions and general from moving. They must attack this first.',
    spriteId: 'taunt',
    aliases: ['provoke']
  },
  PROVOKED: {
    id: 'provoked',
    name: 'Provoked',
    description: 'Provoked - cannot move and must attackProvoker first.',
    spriteId: 'taunted',
    aliases: []
  },
  VEIL: {
    id: 'veil',
    name: 'Veil',
    description: 'Cannot be targeted by spells',
    aliases: []
  },
  GROW: {
    id: 'grow',
    name: 'Grow',
    description: 'This unit gains attack and hp at the starts of its turn.',
    aliases: []
  },
  REBIRTH: {
    id: 'rebirth',
    name: 'Rebirth',
    description:
      'When destroyed, summon an egg on this space that hatches into a copy of it at the end of your next turn.',
    aliases: []
  },
  INFILTRATE: {
    id: 'infiltrate',
    name: 'Infiltrate',
    description:
      "Has an additional effect when on the opponent's side of the battlefield",
    aliases: []
  },
  SPAWN: {
    id: 'spawn',
    name: 'Spawn',
    description:
      'Pick a space when this unit is summoned. At the start of your turn, summon a unit on this space, or deal 2 damage if an enemy unit is standing on it.',
    aliases: []
  },
  EPHEMERAL: {
    id: 'ephemeral',
    name: 'Ephemeral',
    description: "This unit disappears at the end of its owner's turn.",
    aliases: [],
    spriteId: 'ephemeral'
  },
  BLAST: {
    id: 'blast',
    name: 'Blast',
    description:
      'Can attack any enemy in front, behind, above of below it. If it does, it attacks all enemies in that direction',
    aliases: []
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);

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
  OPENING_GAMBIT: {
    id: 'opening_gambit',
    name: 'Opening Gambit',
    description: 'Triggers when the unit enters the battlefield.',
    aliases: []
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
  FEARSOME: {
    id: 'fearsomem',
    name: 'Fearsome',
    description: 'Prevents targeted units from retaliating.',
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
    aliases: ['freeze'],
    spriteId: 'frozen'
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
    description: 'Gain 1 gold when it deals damage to another unit.',
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
  SUMMON: {
    id: 'summon',
    name: 'Summon',
    description: 'A summoned unit didn`t come from your action bar.',
    aliases: []
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
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);

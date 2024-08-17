import type { Values } from '@game/shared';

export type Tag = {
  id: string;
  name: string;
  aliases: string[];
};

export const TAGS = {
  ELEMENTAL: {
    id: 'elemental',
    name: 'Elemental',
    aliases: []
  },
  VESPYR: {
    id: 'vespyr',
    name: 'Vespyr',
    aliases: []
  },
  ARCANYST: {
    id: 'arcanyst',
    name: 'Arcanyst',
    aliases: []
  },
  DERVISH: {
    id: 'dervish',
    name: 'Dervish',
    aliases: ['dervishes']
  },
  GOLEM: {
    id: 'golem',
    name: 'Golem',
    aliases: []
  }
} as const satisfies Record<string, Tag>;

export type TagId = Values<typeof TAGS>['id'];

export const getTagById = (id: TagId) => Object.values(TAGS).find(t => t.id === id);

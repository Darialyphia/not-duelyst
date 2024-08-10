import type { Values } from '@game/shared';

export type Tag = {
  id: string;
  name: string;
};

export const TAGS = {
  ELEMENTAL: {
    id: 'elemental',
    name: 'Elemental'
  },
  VESPYR: {
    id: 'vespyr',
    name: 'Vespyr'
  },
  ARCANYST: {
    id: 'arcanyst',
    name: 'Arcanyst'
  },
  DERVISH: {
    id: 'dervish',
    name: 'Dervish'
  },
  GOLEM: {
    id: 'golem',
    name: 'Golem'
  }
} as const satisfies Record<string, Tag>;

export type TagId = Values<typeof TAGS>['id'];

export const getTagById = (id: TagId) => Object.values(TAGS).find(t => t.id === id);

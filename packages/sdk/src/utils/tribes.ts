import type { Values } from '@game/shared';

export type Tag = {
  id: string;
  name: string;
};

export const TAGS = {
  ELEMENTAL: {
    id: 'elemental',
    name: 'Elemental'
  }
} as const satisfies Record<string, Tag>;

export type TagId = Values<typeof TAGS>['id'];

export const getTagById = (id: TagId) => Object.values(TAGS).find(t => t.id === id);

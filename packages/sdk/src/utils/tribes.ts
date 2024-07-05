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

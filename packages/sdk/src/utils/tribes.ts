export type Tribe = {
  id: string;
  name: string;
};

export const TRIBES = {
  ELEMENTAL: {
    id: 'elemental',
    name: 'Elemental'
  }
} as const satisfies Record<string, Tribe>;

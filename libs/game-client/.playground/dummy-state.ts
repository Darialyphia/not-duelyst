import type { SerializedGameState } from '@hc/sdk';

export const makeDummyState = async (mapName: string): Promise<SerializedGameState> => {
  const maps = await $fetch('/api/maps');

  return {
    entities: [],
    history: [],
    map: maps[mapName],
    players: [
      {
        id: 'Player1',
        loadout: {
          units: {
            'haven-melee-placeholder': { cooldown: 0 },
            'haven-archer-placeholder': { cooldown: 0 },
            'haven-tank-placeholder': { cooldown: 0 },
            'haven-caster-placeholder': { cooldown: 0 }
          }
        },
        generalId: 'haven-hero-placeholder'
      },
      {
        id: 'Player2',
        loadout: {
          units: {
            'haven-melee-placeholder': { cooldown: 0 },
            'haven-archer-placeholder': { cooldown: 0 },
            'haven-tank-placeholder': { cooldown: 0 },
            'haven-caster-placeholder': { cooldown: 0 }
          }
        },
        generalId: 'haven-hero-placeholder'
      }
    ]
  };
};

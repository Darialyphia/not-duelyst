import type { SerializedGameState } from '@hc/sdk';

export const makeDummyState = async (mapName: string): Promise<SerializedGameState> => {
  const maps = await $fetch('/api/maps');

  return {
    entities: [],
    history: [],
    map: maps[mapName],
    activePlayerId: 'Player1',
    players: [
      {
        id: 'Player1',
        loadout: {
          units: {
            'haven-melee': { cooldown: 0 },
            'haven-archer': { cooldown: 0 },
            'haven-tank': { cooldown: 0 },
            'haven-caster': { cooldown: 0 }
          }
        },
        generalId: 'haven-hero',
        gold: 2
      },
      {
        id: 'Player2',
        loadout: {
          units: {
            'chaos-melee': { cooldown: 0 },
            'chaos-archer': { cooldown: 0 },
            'chaos-tank': { cooldown: 0 },
            'chaos-caster': { cooldown: 0 }
          }
        },
        generalId: 'chaos-hero',
        gold: 2
      }
    ]
  };
};

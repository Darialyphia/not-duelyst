import { api } from '@hc/api';
import type { SerializedGameState } from '@hc/sdk';
import { parse } from 'zipson';

export const makeDummyState = async (mapName: string): Promise<SerializedGameState> => {
  const { data: maps } = useConvexQuery(api.gameMaps.getAll, {});

  const map = computed(() => maps.value?.find(map => map.name === mapName));

  return until(map)
    .not.toBe(undefined)
    .then(() => {
      return {
        turn: 0,
        entities: [],
        history: [],
        map: {
          ...map.value!,
          cells: parse(map.value!.cells)
        },
        activePlayerId: 'Player1',
        players: [
          {
            id: 'Player1',
            name: 'Player 1',
            loadout: {
              units: {
                'chaos-melee': { cooldown: 0 },
                'chaos-archer': { cooldown: 0 },
                'chaos-tank': { cooldown: 0 },
                'chaos-caster': { cooldown: 0 },
                'neutral-thief': { cooldown: 0 },
                'neutral-willowisp': { cooldown: 0 }
              }
            },
            generalId: 'chaos-hero',
            gold: 2
          },
          {
            id: 'Player2',
            name: 'Player 2',
            loadout: {
              units: {
                'haven-melee': { cooldown: 0 },
                'haven-archer': { cooldown: 0 },
                'neutral-willowisp': { cooldown: 0 },
                'haven-paladin': { cooldown: 0 },
                'neutral-titan': { cooldown: 0 },
                'neutral-tank': { cooldown: 0 }
              }
            },
            generalId: 'haven-hero',

            gold: 2
          }
        ]
      } as SerializedGameState;
    });
};

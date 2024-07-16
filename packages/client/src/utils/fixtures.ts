import { TERRAINS, type SerializedGameState } from '@game/sdk';
import { isDefined } from '@game/shared';
import { match } from 'ts-pattern';

const dirtTile = (
  x: number,
  y: number,
  z: number,
  tileBlueprintId: string | undefined
) => ({
  position: { x, y, z },
  terrain: TERRAINS.GROUND,
  spriteId: z === 0 ? 'dirt-edge' : 'dirt',
  tileBlueprintId: tileBlueprintId ?? null
});
const grassTile = (
  x: number,
  y: number,
  z: number,
  tileBlueprintId: string | undefined
) => ({
  position: { x, y, z },
  terrain: TERRAINS.GROUND,
  spriteId: z === 0 ? 'grass-edge' : 'grass',
  tileBlueprintId: tileBlueprintId ?? null
});
const waterTile = (
  x: number,
  y: number,
  z: number,
  tileBlueprintId: string | undefined
) => ({
  position: { x, y, z },
  terrain: TERRAINS.WATER,
  spriteId: 'water',
  tileBlueprintId: tileBlueprintId ?? null
});

const makeRow = (
  y: number,
  z: number,
  cells: Array<'dirt' | 'grass' | 'water' | null>,
  tiles?: Record<number, string>
) => {
  return cells
    .map((tile, index) => {
      return match(tile)
        .with('dirt', () => dirtTile(index, y, z, tiles?.[index]))
        .with('grass', () => grassTile(index, y, z, tiles?.[index]))
        .with('water', () => waterTile(index, y, z, tiles?.[index]))
        .with(null, () => undefined)
        .exhaustive();
    })
    .filter(isDefined);
};

const makeColumn = (
  x: number,
  z: number,
  cells: Array<'dirt' | 'grass' | 'water' | null>,
  tiles?: Record<number, string>
) => {
  return cells
    .map((tile, index) => {
      return match(tile)
        .with('dirt', () => dirtTile(x, index, z, tiles?.[index]))
        .with('grass', () => grassTile(x, index, z, tiles?.[index]))
        .with('water', () => waterTile(x, index, z, tiles?.[index]))
        .with(null, () => undefined)
        .exhaustive();
    })
    .filter(isDefined);
};

export const tutorialMap: SerializedGameState['map'] = {
  width: 8,
  height: 8,
  player1StartPosition: { x: 0, y: 3, z: 0 },
  player2StartPosition: { x: 7, y: 3, z: 0 },
  cells: [
    ...makeRow(0, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(1, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(2, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(3, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(4, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(5, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(6, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(7, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ])
  ]
};

export const testMap: SerializedGameState['map'] = {
  width: 9,
  height: 5,
  player1StartPosition: { x: 0, y: 2, z: 0 },
  player2StartPosition: { x: 8, y: 2, z: 0 },
  cells: [
    ...makeColumn(0, 0, ['grass', 'grass', 'grass', 'grass', 'grass']),
    ...makeColumn(1, 0, ['grass', 'grass', 'grass', 'grass', 'grass']),
    ...makeColumn(2, 0, ['grass', 'grass', 'grass', 'grass', 'grass']),
    ...makeColumn(3, 0, ['grass', 'grass', 'grass', 'grass', 'grass']),
    ...makeColumn(4, 0, ['grass', 'grass', 'grass', 'grass', 'grass'], {
      0: 'gold_coin',
      4: 'gold_coin'
    }),
    ...makeColumn(5, 0, ['grass', 'grass', 'grass', 'grass', 'grass'], {
      2: 'gold_coin'
    }),
    ...makeColumn(6, 0, ['grass', 'grass', 'grass', 'grass', 'grass']),
    ...makeColumn(7, 0, ['grass', 'grass', 'grass', 'grass', 'grass']),
    ...makeColumn(8, 0, ['grass', 'grass', 'grass', 'grass', 'grass'])
  ]
};

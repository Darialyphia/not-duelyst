import { isDefined } from '@game/shared';
import { match } from 'ts-pattern';
import type { GameFormat } from '../game-session';
import { TERRAINS } from './board-utils';

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

export const tutorialMap: GameFormat['map'] = {
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

const makePlane = (
  x: number,
  y: number,
  z: number,
  spriteId: string,
  xoffset = 0,
  yoffset = 0
) => {
  return Array.from({ length: y }, (_, y) =>
    Array.from({ length: x }, (_, x) => ({
      position: { x: x + xoffset, y: y + yoffset, z },
      terrain: TERRAINS.GROUND,
      spriteId,
      tileBlueprintId: null
    }))
  ).flat();
};

export const defaultMap: GameFormat['map'] = {
  width: 9,
  height: 5,
  player1StartPosition: { x: 0, y: 2, z: 3 },
  player2StartPosition: { x: 8, y: 2, z: 3 },
  cells: [
    ...makePlane(9, 5, 0, 'dirt-edge'),
    ...makePlane(9, 5, 1, 'dirt'),
    ...makePlane(9, 5, 2, 'dirt'),
    ...makeColumn(0, 3, ['grass', 'grass', 'grass', 'grass', 'grass']),
    ...makeColumn(1, 3, ['grass', 'grass', 'grass', 'grass', 'grass']),
    ...makeColumn(2, 3, ['grass', 'grass', 'grass', 'grass', 'grass']),
    ...makeColumn(3, 3, ['grass', 'grass', 'grass', 'grass', 'grass']),
    ...makeColumn(4, 3, ['dirt', 'grass', 'grass', 'grass', 'dirt']),
    ...makeColumn(5, 3, ['grass', 'grass', 'dirt', 'grass', 'grass']),
    ...makeColumn(6, 3, ['grass', 'grass', 'grass', 'grass', 'grass']),
    ...makeColumn(7, 3, ['grass', 'grass', 'grass', 'grass', 'grass']),
    ...makeColumn(8, 3, ['grass', 'grass', 'grass', 'grass', 'grass']),
    {
      position: { x: 4, y: 0, z: 4 },
      spriteId: 'grass',
      terrain: TERRAINS.GROUND,
      tileBlueprintId: 'gold_coin'
    },
    {
      position: { x: 4, y: 4, z: 4 },
      spriteId: 'grass',
      terrain: TERRAINS.GROUND,
      tileBlueprintId: 'gold_coin'
    },
    {
      position: { x: 5, y: 2, z: 4 },
      spriteId: 'grass',
      terrain: TERRAINS.GROUND,
      tileBlueprintId: 'gold_coin'
    }
  ]
};

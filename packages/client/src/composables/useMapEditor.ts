import type { Point3D } from '@game/shared';
import type { AssetsContext } from './useAssets';
import type { IsoCameraContext } from './useIsoCamera';
import type { SerializedCell } from '@game/sdk/src/board/cell';
import { TERRAINS, type Terrain } from '@game/sdk';

export type MapEditorLayer = {
  cells: Omit<SerializedCell, 'spriteId'>[];
  floor: number;
  isVisible: boolean;
};
export type MapEditorContext = {
  camera: IsoCameraContext;
  assets: AssetsContext;
  dimensions: { x: Ref<number>; y: Ref<number> };
  player1Position: Ref<Point3D>;
  player2Position: Ref<Point3D>;
  layers: Ref<Array<MapEditorLayer>>;
  addLayer(): void;
  removeLayer(floor: number): void;
  getLayer(floor: number): MapEditorLayer | undefined;
  terrain: Ref<Terrain>;
  tool: Ref<'add' | 'remove' | 'move' | 'p1Start' | 'p2Start' | 'tile'>;
  isPainting: Ref<boolean>;
  selectedLayer: Ref<number>;
  tileId: Ref<string>;
};

export const MAP_EDITOR_INJECTION_KEY = Symbol(
  'map_editor'
) as InjectionKey<MapEditorContext>;

const DEFAULT_DIMENSIONS = {
  x: 9,
  y: 5
};
export const useMapEditorProvider = () => {
  const camera = useIsoCameraProvider();
  const assets = useAssets();
  const xSize = ref(DEFAULT_DIMENSIONS.x);
  const ySize = ref(DEFAULT_DIMENSIONS.y);

  const ctx: MapEditorContext = {
    camera,
    assets,
    dimensions: {
      x: computed({
        get() {
          return xSize.value;
        },
        set(val) {
          const oldX = xSize.value;
          xSize.value = val;

          if (val > oldX) {
            ctx.layers.value.forEach(layer => {
              for (let x = oldX; x < val; x++) {
                for (let y = 0; y < ySize.value; y++) {
                  layer.cells.push({
                    position: { x, y, z: layer.floor },
                    terrain: TERRAINS.EMPTY,
                    tileBlueprintId: null,
                    defaultRotation: 0
                  });
                }
              }
            });
          } else if (val < oldX) {
            ctx.layers.value.forEach(layer => {
              layer.cells = layer.cells.filter(cell => cell.position.x < val);
            });
          }
        }
      }),
      y: computed({
        get() {
          return ySize.value;
        },
        set(val) {
          const oldY = ySize.value;
          ySize.value = val;

          if (val > oldY) {
            ctx.layers.value.forEach(layer => {
              for (let y = oldY; y < val; y++) {
                for (let x = 0; x < xSize.value; x++) {
                  layer.cells.push({
                    position: { x, y, z: layer.floor },
                    terrain: TERRAINS.EMPTY,
                    tileBlueprintId: null,
                    defaultRotation: 0
                  });
                }
              }
            });
          } else if (val < oldY) {
            ctx.layers.value.forEach(layer => {
              layer.cells = layer.cells.filter(cell => cell.position.y < val);
            });
          }
        }
      })
    },
    player1Position: ref({ x: 0, y: 2, z: 0 }),
    player2Position: ref({ x: 8, y: 2, z: 0 }),
    layers: ref([
      {
        isVisible: true,
        floor: 0,
        cells: Array.from({ length: DEFAULT_DIMENSIONS.y }, (_, y) =>
          Array.from({ length: DEFAULT_DIMENSIONS.x }, (_, x) => ({
            terrain: TERRAINS.EMPTY,
            position: { x, y, z: 0 },
            tileBlueprintId: null,
            defaultRotation: 0 as const
          }))
        ).flat()
      }
    ]),
    selectedLayer: ref(0),
    addLayer() {
      let z = 0;
      let layer: MapEditorLayer | undefined = ctx.layers.value[0];
      while (layer) {
        z++;
        layer = ctx.layers.value.find(l => l.floor === z);
      }

      ctx.layers.value.push({
        isVisible: true,
        floor: z,
        cells: Array.from({ length: ctx.dimensions.y.value }, (_, y) =>
          Array.from({ length: ctx.dimensions.x.value }, (_, x) => ({
            terrain: TERRAINS.EMPTY,
            position: { x, y, z },
            tileBlueprintId: null,
            defaultRotation: 0 as const
          }))
        ).flat()
      });
      ctx.selectedLayer.value = z;
    },
    removeLayer(floor) {
      if (floor === 0) return;

      ctx.layers.value = ctx.layers.value.filter(layer => layer.floor !== floor);
      ctx.layers.value.forEach(layer => {
        if (layer.floor > floor) {
          layer.floor--;
          layer.cells.forEach(cell => {
            cell.position.z = layer.floor;
          });
        }
      });
      if (ctx.selectedLayer.value === floor) {
        ctx.selectedLayer.value--;
      }
    },
    getLayer(floor) {
      return ctx.layers.value.find(l => l.floor === floor);
    },
    terrain: ref(TERRAINS.GROUND),
    tool: ref('move'),
    isPainting: ref(false),
    tileId: ref('gold_coin')
  };
  provide(MAP_EDITOR_INJECTION_KEY, ctx);

  // watch(ctx.dimensions, ({ x, y }, oldDimensions) => {
  //   ctx.layers.value.forEach(layer => {
  //     layer.cells = layer.cells.filter(
  //       cell => cell.position.x < x && cell.position.y < y
  //     );

  //     if (oldDimensions.x >= x || oldDimensions.y >= y) return;

  //     for (let i = 0; i <= x; i++) {
  //       for (let j = 0; j <= y; j++) {
  //         const found = layer.cells.find(
  //           cell => cell.position.x == i && cell.position.y === j
  //         );
  //         if (found) continue;
  //         layer.cells.push({
  //           position: { x: i, y: j, z: layer.floor },
  //           spriteId: 'empty',
  //           terrain: TERRAINS.WATER,
  //           tileBlueprintId: null,
  //           defaultRotation: 0
  //         });
  //       }
  //     }
  //   });
  // });
  return ctx;
};

export const useMapEditor = () => useSafeInject(MAP_EDITOR_INJECTION_KEY);

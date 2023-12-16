<script setup lang="ts">
import { Polygon, type Cursor, FederatedPointerEvent } from 'pixi.js';
import type { Cell, Point3D, SerializedGameState } from '@hc/sdk';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import { useApplication } from 'vue3-pixi';

const { cell } = defineProps<{
  cell: Cell;
  map: {
    width: number;
    height: number;
    cells: Cell[];
    startPositions: [Point3D, Point3D];
  };
  rotation: 0 | 90 | 180 | 270;
}>();

const app = useApplication();

const assets = useAssets();
const spriteTextures = computed(() => {
  return cell.spriteIds.map(spriteId => {
    const sheet = assets.getSprite(spriteId);
    return sheet.animations[0];
  });
});
const hitAreaYOffset = cell.isHalfTile ? CELL_SIZE / 4 : 0;
const hitArea = new Polygon([
  { x: 0, y: 0 + hitAreaYOffset },
  { x: CELL_SIZE / 2, y: CELL_SIZE / 4 + hitAreaYOffset },
  { x: CELL_SIZE / 2, y: CELL_SIZE * 0.75 },
  { x: 0, y: CELL_SIZE },
  { x: -CELL_SIZE / 2, y: CELL_SIZE * 0.75 },
  { x: -CELL_SIZE / 2, y: CELL_SIZE / 4 + hitAreaYOffset }
]);

const hoveredFilter = new ColorOverlayFilter(0x4455bb, 0.5);
const isHovered = ref(false);
</script>

<template>
  <IsoPositioner
    :x="cell.position.x"
    :y="cell.position.y"
    :z="cell.position.z"
    :map="{ width: map.width, height: map.height, rotation: rotation }"
    :animated="false"
  >
    <container
      :hit-area="hitArea"
      :filters="isHovered ? [hoveredFilter] : []"
      @pointerenter="isHovered = true"
      @pointerleave="isHovered = false"
    >
      <animated-sprite
        v-for="(textures, index) in spriteTextures"
        :ky="index"
        :textures="textures"
        :anchor="0.5"
        :y="CELL_SIZE / 2"
      />
    </container>
  </IsoPositioner>
</template>

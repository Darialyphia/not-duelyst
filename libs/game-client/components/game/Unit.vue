<script setup lang="ts">
import type { Entity } from '@hc/sdk/src/entity/entity';
import { Polygon } from 'pixi.js';
import { Cell } from '../../../sdk/src/map/cell';

const { entity } = defineProps<{
  entity: Entity;
}>();

const { gameSession, assets, state, mapRotation } = useGame();
const { hoveredCell } = useGameUi();

const spritesheet = computed(() => assets.getSprite(entity.unitId, 'placeholder'));
const textures = computed(() => createSpritesheetFrameObject('idle', spritesheet.value));

const scaleX = computed(() => {
  if (mapRotation.value === 90 || mapRotation.value === 180) {
    return entity.playerId === state.value.players[0].id ? -1 : 1;
  }

  return entity.playerId === state.value.players[0].id ? 1 : -1;
});

const offset = computed(() => ({
  x: 0,
  z: 0,
  y: gameSession.map.getCellAt(entity.position)?.isHalfTile
    ? -CELL_SIZE * 0.75
    : -CELL_SIZE
}));

const hitArea = computed(() => {
  const meta = spritesheet.value.data.meta as AsepriteMeta;
  const { data } = spritesheet.value;

  const frameSize = {
    w: meta.size.w / Object.keys(data.frames).length,
    h: meta.size.h
  };

  // we need to offset the slice because the sprite has its anchor in the center
  const offset = {
    x: frameSize.w / 2,
    y: frameSize.h / 2
  };

  // default hit area is a square the size of once cell
  const defaultHitArea = new Polygon(
    { x: -CELL_SIZE / 2, y: CELL_SIZE / 2 },
    { x: CELL_SIZE / 2, y: CELL_SIZE / 2 },
    { x: CELL_SIZE / 2, y: CELL_SIZE * 1.5 },
    { x: -CELL_SIZE / 2, y: CELL_SIZE * 1.5 }
  );

  if (!meta.slices) return defaultHitArea;

  const hitAreaSlice = meta.slices.find(slice => slice.name === 'hitArea');
  if (!hitAreaSlice) return defaultHitArea;

  const {
    bounds: { x, y, w, h }
  } = hitAreaSlice.keys[0];

  return new Polygon([
    { x: x - offset.x, y: y - offset.y },
    { x: x + w - offset.x, y: y - offset.y },
    { x: x + w - offset.x, y: y + h - offset.y },
    { x: x - offset.x, y: y + h - offset.y }
  ]);
});
</script>

<template>
  <IsoPositioner
    :x="entity.position.x"
    :y="entity.position.y"
    :z="entity.position.z + 0.1"
    :offset="offset"
  >
    <animated-sprite
      :textures="textures"
      :anchor-x="0.5"
      :scale-x="scaleX"
      :hit-area="hitArea"
      @pointerenter="
        () => {
          hoveredCell = gameSession.map.getCellAt(entity.position);
        }
      "
    >
      <!-- <graphics
        :alpha="0.25"
        @render="
          g => {
            g.clear();
            g.beginFill('red');
            g.drawPolygon(hitArea);
            g.endFill();
          }
        "
      /> -->
    </animated-sprite>
  </IsoPositioner>
</template>

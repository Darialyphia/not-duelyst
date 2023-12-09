<script setup lang="ts">
import type { Entity } from '@hc/sdk/src/entity/entity';

import { Polygon } from 'pixi.js';
import { OutlineFilter } from '@pixi/filter-outline';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { GlowFilter } from '@pixi/filter-glow';
import type { Point3D } from '@hc/sdk/src/types';

const { entity } = defineProps<{
  entity: Entity;
}>();

const { gameSession, assets, state, mapRotation } = useGame();
const { hoveredCell, targetMode, selectedSkill } = useGameUi();

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

const isHovered = computed(
  () =>
    hoveredCell.value &&
    gameSession.entityManager.getEntityAt(hoveredCell.value.position)?.id === entity.id
);

const isSkillTarget = (point: Point3D) => {
  if (targetMode.value !== 'skill') return false;
  if (!selectedSkill.value) return false;

  return selectedSkill.value.isTargetable(gameSession, point, state.value.activeEntity);
};

const activeFilter = new OutlineFilter(1.5, 0xffffff, 0.2, 1);
const selectedfilter = new AdjustmentFilter({
  gamma: 1.3,
  contrast: 1.25,
  saturation: 1.25
});
const inSkillAreaFilter = new GlowFilter({
  outerStrength: 2,
  innerStrength: 1,
  color: 0xff0000,
  alpha: 0.75
});

const filters = computed(() => {
  const result = [];

  if (isHovered.value) {
    result.push(selectedfilter);
  }

  if (state.value.activeEntity.id === entity.id) {
    result.push(activeFilter);
  }

  if (
    hoveredCell.value &&
    isSkillTarget(hoveredCell.value) &&
    selectedSkill.value?.isInAreaOfEffect(
      gameSession,
      entity.position,
      state.value.activeEntity,
      hoveredCell.value.position
    )
  ) {
    result.push(inSkillAreaFilter);
  }
  return result;
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
      :filters="filters"
      @pointerleave="() => (hoveredCell = null)"
      @pointerenter="
        () => {
          hoveredCell = gameSession.map.getCellAt(entity.position);
        }
      "
    />

    <template v-if="isHovered">
      <StatBar
        :z-index="entity.position.y"
        :y="CELL_SIZE * 0.65 - 6"
        :size="3"
        :value="entity.hp"
        :max-value="entity.maxHp"
        :filled-color="0x00cc00"
        :empty-color="0xcc0000"
      />

      <StatBar
        :z-index="entity.position.y"
        :y="CELL_SIZE * 0.65 - 3"
        :size="3"
        :value="entity.ap"
        :max-value="entity.maxAp"
        :filled-color="0x0000cc"
      />
    </template>
  </IsoPositioner>
</template>

<script setup lang="ts">
import type { Entity, Point3D } from '@hc/sdk';
import { PTransition, useApplication } from 'vue3-pixi';
import { Polygon, Container } from 'pixi.js';
import { OutlineFilter } from '@pixi/filter-outline';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { GlowFilter } from '@pixi/filter-glow';
import type { AnimatedSprite, Cursor } from 'pixi.js';
import type { VNodeRef } from 'nuxt/dist/app/compat/capi';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';

const { entity } = defineProps<{
  entity: Entity;
}>();

const app = useApplication();
const { gameSession, assets, state, mapRotation, fx, sendInput } = useGame();
const { hoveredCell, targetMode, selectedSkill, selectedEntity } = useGameUi();

const spritesheet = assets.getSprite(entity.unitId, 'placeholder-unit');
const textures = createSpritesheetFrameObject('idle', spritesheet);

const spriteRef = ref<AnimatedSprite>();
watchEffect(() => {
  fx.spriteMap.set(entity.id, spriteRef);
  spriteRef.value?.gotoAndPlay(0);
});

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
  const meta = spritesheet.data.meta as AsepriteMeta;
  const { data } = spritesheet;

  // we need to offset the slice because the sprite has its anchor in the center
  const offset = {
    x: CELL_SIZE * 1.25,
    y: 0
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

  if (selectedEntity.value === entity) {
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

const cursor = computed(() => {
  const cell = gameSession.map.getCellAt(entity.position);

  if (isSkillTarget(entity.position)) {
    return app.value.renderer.events.cursorStyles.attack as Cursor;
  }
  return undefined;
});

const shadowFilters = [new ColorOverlayFilter(0x000000)];
</script>

<template>
  <IsoPositioner
    :x="entity.position.x"
    :y="entity.position.y"
    :z="entity.position.z"
    :z-index-offset="1"
    :offset="offset"
    :map="{ width: state.map.width, height: state.map.height, rotation: mapRotation }"
  >
    <container :y="-CELL_SIZE / 4" :sortable-children="true">
      <animated-sprite
        v-if="textures?.length"
        :textures="textures"
        :z-index="1"
        :filters="shadowFilters"
        :scale-x="scaleX"
        :scale-y="0.45"
        :skew-x="-1"
        :anchor="0.5"
        :y="CELL_SIZE * 1.45"
        loop
        event-mode="none"
        playing
      />
      <animated-sprite
        ref="spriteRef"
        :textures="textures"
        :anchor-x="0.5"
        :scale-x="scaleX"
        :hit-area="hitArea"
        :filters="filters"
        :cursor="cursor"
        :z-index="2"
        loop
        @pointerup="
          () => {
            if (!isSkillTarget(entity.position)) return;
            sendInput('use-skill', {
              skillId: selectedSkill!.id,
              target: entity.position
            });
          }
        "
        @pointerleave="
          () => {
            hoveredCell = null;
            selectedEntity = null;
          }
        "
        @pointerenter="
          () => {
            selectedEntity = entity;
            hoveredCell = gameSession.map.getCellAt(entity.position);
          }
        "
      />

      <PTransition
        appear
        :duration="{ enter: 100, leave: 100 }"
        :before-enter="{ alpha: 0 }"
        :enter="{ alpha: 1 }"
        :leave="{ alpha: 0 }"
      >
        <UnitStats :entity="entity" v-if="isHovered" />
      </PTransition>
    </container>
  </IsoPositioner>
</template>

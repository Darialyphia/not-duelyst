<script setup lang="ts">
import type { Entity } from '@hc/sdk';
import { PTransition, useApplication } from 'vue3-pixi';
import { Polygon, Container } from 'pixi.js';
import { OutlineFilter } from '@pixi/filter-outline';
import { GlowFilter } from '@pixi/filter-glow';
import { type AnimatedSprite, type Cursor, FederatedMouseEvent } from 'pixi.js';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';

const { entity } = defineProps<{
  entity: Entity;
}>();

const app = useApplication();
const { isActivePlayer, gameSession, assets, state, mapRotation, fx, sendInput, utils } =
  useGame();
const {
  hoveredCell,
  skillTargets,
  selectedSkill,
  selectedEntity,
  targetMode,
  summonTargets
} = useGameUi();

const spritesheet = assets.getSprite(entity.unit.spriteId, 'placeholder-unit');
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

const selectedFilter = new OutlineFilter(1.5, 0xffffff, 0.2, 1);

const inSkillAreaFilter = new GlowFilter({
  outerStrength: 2,
  innerStrength: 1,
  color: 0xff0000,
  alpha: 0.75
});

const filters = computed(() => {
  const result = [];

  if (selectedEntity.value?.equals(entity)) {
    result.push(selectedFilter);
  }

  if (
    hoveredCell.value &&
    selectedEntity.value &&
    utils.canCastSkillAt(hoveredCell.value) &&
    selectedSkill.value?.isInAreaOfEffect(
      gameSession,
      entity.position,
      selectedEntity.value,
      [...skillTargets.value, hoveredCell.value.position]
    )
  ) {
    result.push(inSkillAreaFilter);
  }
  return result;
});

const cursor = computed(() => {
  if (utils.canCastSkillAt(entity.position)) {
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
        @pointerdown="
          (e: FederatedMouseEvent) => {
            if (e.button !== 0) return;
            if (targetMode === null) {
              selectedEntity = entity;
              if (entity.player.equals(state.activePlayer)) targetMode = 'move';
            }
          }
        "
        @pointerup="
          (e: FederatedMouseEvent) => {
            if (e.button !== 0) return;
            if (targetMode === 'move') targetMode = null;
            if (!selectedEntity) return;
            if (utils.canCastSkillAt(entity.position)) {
              return skillTargets.add(entity.position);
            }
            if (utils.isValidSummonTarget(entity.position)) {
              return summonTargets.add(entity.position);
            }
          }
        "
        @pointerenter="
          () => {
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
        <UnitStats v-if="isHovered" :entity="entity" />
      </PTransition>
    </container>
  </IsoPositioner>
</template>

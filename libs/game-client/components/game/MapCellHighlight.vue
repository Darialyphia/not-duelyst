<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import type { Container, Cursor } from 'pixi.js';
import type { Cell, Point3D } from '@hc/sdk';
import { isDefined } from '@hc/shared';

const { cell, cursor } = defineProps<{
  cursor?: Cursor;
  cell: Cell;
}>();

const { state, gameSession, mapRotation, assets, utils } = useGame();
const { hoveredCell, targetMode } = useGameUi();

const isHoveringActiveEntity = computed(
  () =>
    hoveredCell.value?.id ===
    gameSession.map.getCellAt(state.value.activeEntity.position)?.id
);

const isHighlighted = computed(() => {
  if (!cell) return;

  switch (targetMode.value) {
    case 'skill':
      return utils.isSkillTarget(cell.position);
    case 'summon':
      return utils.isSummonTarget(cell.position);
    case 'move':
      return (
        utils.isMoveTarget(cell.position) &&
        state.value.activeEntity.remainingMovement > 0
      );
    default:
      return isHoveringActiveEntity.value && utils.isMoveTarget(cell.position);
  }
});

const getCellBitmask = () => {
  if (!cell) return null;

  return getBitMask(gameSession, state.value, cell, mapRotation.value, neighbor => {
    if (!neighbor) return false;
    if (targetMode.value === 'skill') {
      return utils.isSkillTarget(neighbor.position);
    }
    if (targetMode.value === 'summon') {
      return (
        utils.isSummonTarget(neighbor.position) &&
        !gameSession.entityManager.getEntityAt(neighbor.position)
      );
    }

    return utils.isMoveTarget(neighbor);
  });
};

const tileset = computed(() =>
  targetMode.value === 'skill'
    ? assets.getSprite('targetable_cell')
    : assets.getSprite('movable_cell')
);

const texture = computed(() => {
  const bitMask = getCellBitmask();

  if (!isDefined(bitMask)) return;

  return getTextureIndexFromBitMask(bitMask, tileset.value);
});

const onBeforeEnter = (el: Container) => {
  nextTick(() => {
    gsap.set(el, {
      pixi: {
        alpha: 0
      }
    });
  });
};

const onEnter = (el: Container, done: () => void) => {
  gsap.to(el, {
    duration: 0.5,
    ease: Power2.easeOut,
    onComplete: done,
    pixi: {
      alpha: 1
    }
  });
};
const onLeave = (el: Container, done: () => void) => {
  gsap.to(el, {
    duration: 0.5,
    ease: Power2.easeOut,
    onComplete: done,
    pixi: {
      alpha: 0
    }
  });
};

const { autoDestroyRef } = useAutoDestroy();
</script>

<template>
  <PTransition appear @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
    <container
      v-if="texture && isHighlighted"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
      :x="-CELL_SIZE / 2"
      :y="gameSession.map.getCellAt(cell)?.isHalfTile ? CELL_SIZE / 4 : 0"
    >
      <sprite :texture="texture" :cursor="cursor" />
    </container>
  </PTransition>
</template>

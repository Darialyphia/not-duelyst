<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import type { Container, Cursor } from 'pixi.js';
import type { Cell } from '@hc/sdk/src/map/cell';
import type { Point3D } from '@hc/sdk/src/types';

const { cell, cursor } = defineProps<{
  cursor?: Cursor;
  cell: Cell;
}>();

const { state, gameSession, mapRotation, assets } = useGame();
const { hoveredCell, targetMode, distanceMap } = useGameUi();
const isHoveringActiveEntity = computed(
  () =>
    hoveredCell.value?.id ===
    gameSession.map.getCellAt(state.value.activeEntity.position)?.id
);

const isSummonTarget = (point: Point3D) => {
  if (targetMode.value !== 'summon') return false;

  return (
    gameSession.map.canSummonAt(point) &&
    gameSession.entityManager.hasNearbyAllies(point, state.value.activeEntity.playerId)
  );
};

const isMoveTarget = (point: Point3D) => {
  if (targetMode.value !== 'move') return false;
  return state.value.activeEntity.canMove(distanceMap.value.get(point));
};

const isSkillHighlighted = (cell: Cell) => {
  return false;
  // if (!selectedSkill.value) return false;

  // const ability = createSkillAbility(
  //   state.value,
  //   selectedSkill.value,
  //   activeEntity.value
  // );

  // return ability.can('highlight', subject('cell', { x: cell.x, y: cell.y }));
};

const isHighlighted = computed(() => {
  if (!cell) return;

  switch (targetMode.value) {
    case 'skill':
      return isSkillHighlighted(cell);
    case 'summon':
      return isSummonTarget(cell.position);
    case 'move':
      return (
        isMoveTarget(cell.position) && state.value.activeEntity.remainingMovement > 0
      );
    default:
      return isHoveringActiveEntity.value && isMoveTarget(cell.position);
  }
});

const getCellBitmask = () => {
  if (!cell) return null;

  return getBitMask(gameSession, state.value, cell, mapRotation.value, neighbor => {
    if (!neighbor) return false;
    if (targetMode.value === 'skill') {
      return isSkillHighlighted(neighbor);
    }
    if (targetMode.value === 'summon') {
      return (
        isSummonTarget(neighbor.position) &&
        !gameSession.entityManager.getEntityAt(neighbor.position)
      );
    }

    return isMoveTarget(neighbor);
  });
};

const tileset = computed(() =>
  targetMode.value === 'skill'
    ? assets.getSprite('targetable_cell')
    : assets.getSprite('movable_cell')
);

const texture = computed(() => {
  const bitMask = getCellBitmask();
  if (!bitMask) return;

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
      :ref="autoDestroyRef"
      event-mode="none"
      :x="-CELL_SIZE / 2"
      :y="gameSession.map.getCellAt(cell)?.isHalfTile ? CELL_SIZE / 4 : 0"
    >
      <sprite :texture="texture" :cursor="cursor" />
    </container>
  </PTransition>
</template>

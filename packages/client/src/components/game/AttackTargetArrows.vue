<script setup lang="ts">
import { PTransitionGroup } from 'vue3-pixi';
import { DropShadowFilter } from '@pixi/filter-drop-shadow';

const { ui, pathfinding, camera, session } = useGame();
const entities = useGameSelector(session => session.entitySystem.getList());
const userPlayer = useUserPlayer();

const boardDimensions = {
  width: session.boardSystem.width,
  height: session.boardSystem.height
};

const attackerPositions = computed(() => {
  return entities.value
    .filter(entity => {
      if (ui.targetingMode.value === TARGETING_MODES.BASIC) {
        if (
          ui.hoveredCell.value &&
          ui.selectedEntity.value &&
          !entity.player.equals(userPlayer.value) &&
          pathfinding.canMoveTo(ui.selectedEntity.value, ui.hoveredCell.value) &&
          pathfinding.canAttackAt(entity, ui.hoveredCell.value)
        ) {
          return true;
        }
      }
      if (ui.targetingMode.value === TARGETING_MODES.SUMMON) {
        if (
          ui.hoveredCell.value &&
          !entity.player.equals(userPlayer.value) &&
          pathfinding.canAttackAt(entity, ui.hoveredCell.value)
        ) {
          return true;
        }
      }

      return false;
    })
    .map(entity => {
      const iso = toIso(entity.position, camera.angle.value, boardDimensions);
      return {
        id: entity.id,
        x: iso.isoX,
        y: iso.isoY - iso.isoZ,
        cartesianPos: entity.position
      };
    });
});

const hoveredCellIsoPosition = computed(() => {
  if (!ui.hoveredCell.value) return null;
  const iso = toIso(ui.hoveredCell.value, camera.angle.value, boardDimensions);
  return {
    x: iso.isoX,
    y: iso.isoY - iso.isoZ
  };
});

const filters = [
  new DropShadowFilter({
    alpha: 0.8,
    color: 0xe93100,
    quality: 3,
    offset: {
      x: 0,
      y: 4
    }
  })
];
</script>

<template>
  <PTransitionGroup
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <graphics
      v-for="pos in attackerPositions"
      :key="pos.id"
      :z-index="9999"
      :z-order="9999"
      :y="-CELL_HEIGHT * 0.5"
      :alpha="0.75"
      :filters="filters"
      @render="
        g => {
          if (!hoveredCellIsoPosition) return;
          g.clear();
          g.moveTo(pos.x, pos.y);
          g.lineStyle(3, '#e93100');
          const midPoint = {
            x: (pos.cartesianPos.x + ui.hoveredCell.value!.x) / 2,
            y: (pos.cartesianPos.y + ui.hoveredCell.value!.y) / 2,
            z: (pos.cartesianPos.z + ui.hoveredCell.value!.z) / 2
          };

          const iso = toIso(
            { ...midPoint, z: midPoint.z + 8 },
            camera.angle.value,
            boardDimensions
          );

          g.quadraticCurveTo(
            iso.isoX,
            iso.isoY - iso.isoZ,
            hoveredCellIsoPosition.x,
            hoveredCellIsoPosition.y + 20
          );
        }
      "
    />
  </PTransitionGroup>
</template>

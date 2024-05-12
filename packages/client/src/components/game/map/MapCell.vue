<script setup lang="ts">
import type { CellId } from '@game/sdk/src/board/cell';
import type { FederatedPointerEvent } from 'pixi.js';
import { match } from 'ts-pattern';
import {
  DEFAULT_MOUSE_LIGHT_COLOR,
  DEFAULT_MOUSE_LIGHT_STRENGTH
} from '@/composables/useGameUi';

const { cellId } = defineProps<{ cellId: CellId }>();

const { camera, ui, dispatch, pathfinding, fx, session } = useGame();
const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);
const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);

const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));

const isActivePlayer = useIsActivePlayer();
const isHovered = computed(() => ui.hoveredCell.value?.equals(cell.value));

const isFollowupTargetable = computed(() => {
  if (!ui.selectedCard.value) return false;
  return ui.selectedCard.value.blueprint.followup?.isTargetable(cell.value, {
    session,
    summonedPoint: ui.summonTarget.value!,
    card: ui.selectedCard.value!
  });
});

const isSkillTargetable = computed(() => {
  if (!ui.selectedSkill.value) return false;
  return ui.selectedSkill.value.blueprint.isTargetable(cell.value, {
    session,
    castPoints: ui.skillTargets.value,
    skill: ui.selectedSkill.value
  });
});

const move = () => {
  if (pathfinding.canMoveTo(ui.selectedEntity.value!, cell.value)) {
    dispatch('move', {
      entityId: ui.selectedEntity.value!.id,
      position: cell.value.position
    });
  }
};

const attack = () => {
  if (!cell.value.entity) return;

  if (cell.value.entity.player.equals(activePlayer.value)) {
    ui.selectEntity(cell.value.entity.id);
  } else if (ui.selectedEntity.value!.canAttack(cell.value.entity)) {
    dispatch('attack', {
      targetId: cell.value.entity.id,
      entityId: ui.selectedEntity.value!.id
    });
  }
};

const summon = () => {
  if (!ui.selectedCard.value?.canPlayAt(cell.value.position)) return;
  if (ui.selectedCard.value.blueprint.followup) {
    ui.summonTarget.value = cell.value.position;
    ui.switchTargetingMode(TARGETING_MODES.FOLLOWUP);
  } else {
    dispatch('playCard', {
      cardIndex: ui.selectedCardIndex.value!,
      position: cell.value.position,
      targets: []
    });
    ui.unselectCard();
  }
};

const highlightTarget = () => {
  ui.mouseLightStrength.value = 3;
  ui.mouseLightColor.value = cell.value.entity?.player.equals(activePlayer.value)
    ? '#77ff77'
    : '#ff7777';
};
</script>

<template>
  <IsoPositioner
    :animated="!fx.isPlaying.value"
    v-bind="cell.position"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
  >
    <container>
      <container
        @pointerenter="
          () => {
            ui.hoverAt(cell.position);
            if (!isActivePlayer) return;
            match(ui.targetingMode.value)
              .with(TARGETING_MODES.SUMMON, TARGETING_MODES.NONE, () => {})
              .with(TARGETING_MODES.BASIC, () => {
                if (
                  ui.selectedEntity.value &&
                  isHovered &&
                  ui.hoveredEntity.value?.isEnemy(ui.selectedEntity.value.id) &&
                  ui.selectedEntity.value.canAttack(ui.hoveredEntity.value)
                ) {
                  highlightTarget();
                }
              })
              .with(TARGETING_MODES.FOLLOWUP, () => {
                if (!cell.entity) return;
                if (!ui.selectedCard.value) return;
                if (isFollowupTargetable) {
                  highlightTarget();
                }
              })
              .with(TARGETING_MODES.SKILL, () => {
                if (!cell.entity) return;
                if (!ui.selectedSkill.value) return;
                if (isSkillTargetable) {
                  highlightTarget();
                }
              })
              .exhaustive();
          }
        "
        @pointerleave="
          () => {
            ui.unhover();
            ui.mouseLightColor.value = DEFAULT_MOUSE_LIGHT_COLOR;
            ui.mouseLightStrength.value = DEFAULT_MOUSE_LIGHT_STRENGTH;
          }
        "
        @pointerup="
          (event: FederatedPointerEvent) => {
            if (event.button === 2) {
              if (cell.entity) {
                ui.highlightEntity(cell.entity.id);
              } else {
                ui.unselectEntity();
                ui.unselectCard();
              }
              return;
            }

            if (!isActivePlayer) return;

            match(ui.targetingMode.value)
              .with(TARGETING_MODES.BASIC, () => {
                if (cell.entity) {
                  attack();
                } else {
                  move();
                }
              })
              .with(TARGETING_MODES.SUMMON, () => {
                summon();
              })
              .with(TARGETING_MODES.FOLLOWUP, () => {
                if (!ui.selectedCard.value) return;
                if (isFollowupTargetable) {
                  ui.followupTargets.value.push(cell.position);
                }
              })
              .with(TARGETING_MODES.SKILL, () => {
                if (!ui.selectedSkill.value) return;
                if (isSkillTargetable) {
                  ui.skillTargets.value.push(cell.position);
                }
              })
              .with(TARGETING_MODES.NONE, () => {
                if (cell.entity?.player.equals(activePlayer)) {
                  ui.selectEntity(cell.entity.id);
                }
              })
              .exhaustive();
          }
        "
      >
        <MapCellSprite :cell-id="cellId" />
      </container>
      <MapCellHighlights :cell="cell" />

      <HoveredCell v-if="isHovered" />
    </container>
  </IsoPositioner>

  <Tile v-if="cell.tile" :cell-id="cellId" />
</template>

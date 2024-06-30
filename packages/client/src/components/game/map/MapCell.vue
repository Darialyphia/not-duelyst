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
const { settings: userSettings } = useUserSettings();

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

const pointerenterSound = useSound(
  computed(() => `/assets/sfx/button-hover.mp3`),
  { volume: userSettings.value.sound.sfxVolume[0] / 100 }
);
const pointerupSound = useSound(
  computed(() => `/assets/sfx/button-click.mp3`),
  { volume: userSettings.value.sound.sfxVolume[0] / 100 }
);

const move = () => {
  if (pathfinding.canMoveTo(ui.selectedEntity.value!, cell.value)) {
    pointerupSound.play();
    dispatch('move', {
      entityId: ui.selectedEntity.value!.id,
      position: cell.value.position
    });
  }
};

const attack = () => {
  if (!cell.value.entity) return;

  pointerupSound.play();
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
  ui.summonTarget.value = cell.value.position;
  if (ui.selectedCard.value.blueprint.blueprintFollowup) {
    ui.switchTargetingMode(TARGETING_MODES.BLUEPRINT_FOLLOWUP);
  } else if (ui.selectedCard.value.blueprint.followup) {
    ui.switchTargetingMode(TARGETING_MODES.FOLLOWUP);
  } else {
    pointerupSound.play();
    dispatch('playCard', {
      cardIndex: ui.selectedCardIndex.value!,
      position: ui.summonTarget.value!,
      targets: [],
      blueprintFollowup: ui.followupBlueprintIndexes.value
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
    :interactive-children="false"
    @pointerenter="
      () => {
        ui.hoverAt(cell.position);
        if (cell.entity || cell.tile) {
          pointerenterSound.play();
        }
        if (!isActivePlayer) return;
        match(ui.targetingMode.value)
          .with(
            TARGETING_MODES.SUMMON,
            TARGETING_MODES.NONE,
            TARGETING_MODES.BLUEPRINT_FOLLOWUP,
            () => {}
          )
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
            ui.highlightedCard.value = cell.entity.card;
          } else {
            ui.unselectEntity();
            ui.unselectCard();
          }
          return;
        }

        if (!isActivePlayer) return;

        match(ui.targetingMode.value)
          .with(TARGETING_MODES.BLUEPRINT_FOLLOWUP, () => {})
          .with(TARGETING_MODES.BASIC, () => {
            if (cell.entity) {
              if (ui.selectedEntity.value?.equals(cell.entity)) {
                ui.unselectEntity();
                return;
              }
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
              pointerupSound.play();
            }
          })
          .with(TARGETING_MODES.SKILL, () => {
            if (!ui.selectedSkill.value) return;
            if (isSkillTargetable) {
              ui.skillTargets.value.push(cell.position);
              pointerupSound.play();
            }
          })
          .with(TARGETING_MODES.NONE, () => {
            if (cell.entity?.player.equals(activePlayer)) {
              ui.selectEntity(cell.entity.id);
              pointerupSound.play();
            }
          })
          .exhaustive();
      }
    "
  >
    <MapCellSprite :cell-id="cellId" />
    <MapCellHighlights :cell="cell" />
    <HoveredCell v-if="isHovered" />
  </IsoPositioner>

  <Tile :cell-id="cellId" />
</template>

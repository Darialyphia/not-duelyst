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

const isTargetable = computed(() => {
  if (!ui.selectedCard.value) return false;
  return ui.selectedCard.value.blueprint.targets?.isTargetable(cell.value, {
    session,
    playedPoint: ui.summonTarget.value ?? undefined,
    targets: ui.cardTargets.value,
    card: ui.selectedCard.value!
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

const userPlayer = useUserPlayer();
const summon = () => {
  if (!ui.selectedCard.value?.canPlayAt(cell.value.position)) {
    ui.unselectCard();
    return;
  }
  if (!userPlayer.value.canPlayCardAtIndex(ui.selectedCardIndex.value!)) {
    ui.unselectCard();
    return;
  }

  ui.summonTarget.value = cell.value.position;
  if (ui.selectedCard.value.blueprint.cardChoices) {
    ui.switchTargetingMode(TARGETING_MODES.CARD_CHOICE);
  } else if (ui.selectedCard.value.blueprint.targets) {
    ui.switchTargetingMode(TARGETING_MODES.TARGETING);
  } else {
    pointerupSound.play();
    dispatch('playCard', {
      cardIndex: ui.selectedCardIndex.value!,
      position: ui.summonTarget.value!,
      targets: [],
      cardChoices: ui.cardChoiceIndexes.value
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

const selectEntity = () => {
  if (cell.value.entity?.player.equals(activePlayer.value)) {
    ui.selectEntity(cell.value.entity.id);
    pointerupSound.play();
  }
};

const onPointerdown = (event: FederatedPointerEvent) => {
  if (event.button !== 0) return;

  if (!isActivePlayer) return;
  match(ui.targetingMode.value)
    .with(TARGETING_MODES.NONE, () => {
      selectEntity();
    })
    .otherwise(() => {
      return;
    });
};

const onPointerup = (event: FederatedPointerEvent) => {
  if (event.button === 2) {
    if (cell.value.entity) {
      ui.highlightedCard.value = cell.value.entity.card;
    } else {
      ui.unselectEntity();
      ui.unselectCard();
    }
    return;
  }

  if (!isActivePlayer) return;
  match(ui.targetingMode.value)
    .with(TARGETING_MODES.CARD_CHOICE, () => {
      return;
    })
    .with(TARGETING_MODES.BASIC, () => {
      if (cell.value.entity) {
        if (ui.selectedEntity.value?.equals(cell.value.entity)) {
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
    .with(TARGETING_MODES.TARGETING, () => {
      if (!ui.selectedCard.value) return;
      if (isTargetable) {
        ui.cardTargets.value.push(cell.value.position);
        pointerupSound.play();
      } else if (ui.selectedCard.value.blueprint.targets?.maxTargetCount === 1) {
        ui.unselectCard();
      }
    })
    .with(TARGETING_MODES.NONE, () => {
      return;
    })
    .exhaustive();
};
</script>

<template>
  <IsoPositioner
    :animated="!fx.isPlaying.value"
    v-bind="cell.position"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
    event-mode="static"
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
            TARGETING_MODES.CARD_CHOICE,
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
          .with(TARGETING_MODES.TARGETING, () => {
            if (!cell.entity) return;
            if (!ui.selectedCard.value) return;
            if (isTargetable) {
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
    @pointerdown="onPointerdown"
    @pointerup="onPointerup"
  >
    <MapCellSprite :cell-id="cellId" />
    <MapCellHighlights :cell="cell" />
    <HoveredCell v-if="isHovered" />
  </IsoPositioner>

  <Tile :cell-id="cellId" />
</template>

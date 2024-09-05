<script setup lang="ts">
import type { FederatedPointerEvent } from 'pixi.js';
import { match } from 'ts-pattern';
import {
  DEFAULT_MOUSE_LIGHT_COLOR,
  DEFAULT_MOUSE_LIGHT_STRENGTH
} from '@/composables/useGameUi';
import { debounce } from 'lodash-es';

const { cell } = defineProps<{ cell: CellViewModel }>();

const { camera, ui, dispatch, pathfinding, fx, session, requestSimulation } = useGame();

const boardDimensions = {
  width: session.boardSystem.width,
  height: session.boardSystem.height
};

const isActivePlayer = useIsActivePlayer();
const isHovered = computed(() => ui.hoveredCell.value?.equals(cell.getCell()));

const isTargetable = () => {
  return ui.targetableCells.value.some(c => c.equals(cell.getCell()));
};

const pointerenterSound = useSoundEffect(`button-hover.m4a`);
const pointerupSound = useSoundEffect(`board-click.m4a`);

const move = () => {
  if (pathfinding.canMoveTo(ui.selectedEntity.value!, cell.position)) {
    pointerupSound.play();
    dispatch('move', {
      entityId: ui.selectedEntity.value!.id,
      position: cell.position
    });
  } else {
    ui.unselectEntity();
  }
};

const attack = () => {
  const entity = cell.getCell().entity;
  if (!entity) return;

  pointerupSound.play();
  if (entity.belongsToActivePlayer) {
    ui.selectEntity(entity.id);
  } else if (ui.selectedEntity.value!.canAttack(entity)) {
    dispatch('attack', {
      targetId: entity.id,
      entityId: ui.selectedEntity.value!.id
    });
  }
};

const userPlayer = useUserPlayer();
const summon = () => {
  if (!ui.selectedCard.value?.canPlayAt(cell.position)) {
    ui.unselectCard();
    return;
  }
  if (!userPlayer.value.canPlayCardAtIndex(ui.selectedCardIndex.value!)) {
    ui.unselectCard();
    return;
  }

  ui.summonTarget.value = cell.position;
  pointerupSound.play();
  if (ui.selectedCard.value.meta.adapt) {
    ui.switchTargetingMode(TARGETING_MODES.CARD_CHOICE);
  } else if (ui.selectedCard.value.targets) {
    ui.switchTargetingMode(TARGETING_MODES.TARGETING);
  } else {
    dispatch('playCard', {
      cardIndex: ui.selectedCardIndex.value!,
      position: ui.summonTarget.value!,
      targets: [],
      choice: ui.cardChoice.value ?? 0
    });
    ui.unselectCard();
  }
};

const selectEntity = () => {
  const entity = cell.getCell().entity;
  if (entity?.belongsToActivePlayer) {
    ui.selectEntity(entity.id);
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
  const entity = cell.getCell().entity;
  if (event.button === 2) {
    if (entity) {
      ui.highlightedCard.value = entity.card;
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
      if (entity) {
        if (ui.selectedEntity.value?.equals(entity)) {
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
      if (isTargetable()) {
        ui.cardTargets.value.push(cell.position);
        pointerupSound.play();
      } else if (ui.selectedCard.value.targets?.maxTargetCount === 1) {
        ui.unselectCard();
      }
    })
    .with(TARGETING_MODES.NONE, () => {
      return;
    })
    .exhaustive();
};

const runSimulation = <T extends keyof GameEmits>(action: {
  type: T;
  payload: GameEmits[T][0];
}) => {
  requestSimulation(action);
  ui.isSimulationResultDisplayed.value = true;
};

const hasCellAbove = computed(
  () => !!session.boardSystem.getCellAt({ ...cell.position, z: cell.position.z + 1 })
);
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
        const entity = cell.getCell().entity;
        if (entity || cell.tile) {
          pointerenterSound.play();
        }
        if (!isActivePlayer) return;
        match(ui.targetingMode.value)
          .with(TARGETING_MODES.NONE, TARGETING_MODES.CARD_CHOICE, () => {})
          .with(TARGETING_MODES.SUMMON, () => {
            if (!ui.selectedCard.value?.canPlayAt(cell.position)) {
              return;
            }
            if (!userPlayer.canPlayCardAtIndex(ui.selectedCardIndex.value!)) {
              return;
            }
            if (ui.selectedCard.value.meta.adapt) {
              return;
            }
            runSimulation({
              type: 'playCard',
              payload: {
                cardIndex: ui.selectedCardIndex.value!,
                position: cell.position.serialize(),
                targets: [],
                choice: ui.cardChoice.value ?? 0
              }
            });
          })
          .with(TARGETING_MODES.BASIC, () => {
            if (
              entity &&
              ui.selectedEntity.value &&
              isHovered &&
              ui.hoveredEntity.value?.isEnemy(ui.selectedEntity.value.id) &&
              ui.selectedEntity.value.canAttack(ui.hoveredEntity.value)
            ) {
              return runSimulation({
                type: 'attack',
                payload: {
                  targetId: entity.id,
                  entityId: ui.selectedEntity.value!.id
                }
              });
            }

            if (
              !entity &&
              pathfinding.canMoveTo(ui.selectedEntity.value!, cell.getCell())
            ) {
              return runSimulation({
                type: 'move',
                payload: {
                  entityId: ui.selectedEntity.value!.id,
                  position: cell.position
                }
              });
            }
          })
          .with(TARGETING_MODES.TARGETING, () => {
            if (!ui.selectedCard.value) return;

            if (isTargetable()) {
              runSimulation({
                type: 'playCard',
                payload: {
                  cardIndex: ui.selectedCardIndex.value!,
                  position: ui.summonTarget.value ?? { x: 0, y: 0, z: 0 },
                  targets: ui.cardTargets.value.concat(cell.position),
                  choice: ui.cardChoice.value ?? 0
                }
              });
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
        ui.isSimulationResultDisplayed.value = false;
      }
    "
    @pointerdown="onPointerdown"
    @pointerup="onPointerup"
  >
    <MapCellSprite :cell="cell" />

    <template v-if="!hasCellAbove">
      <MapCellHighlights :cell="cell" />
      <HoveredCell v-if="isHovered" />
    </template>
  </IsoPositioner>

  <Tile :cell="cell" />
</template>

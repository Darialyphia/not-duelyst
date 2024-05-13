<script setup lang="ts">
import type { CellId } from '@game/sdk/src/board/cell';
import { type Nullable, isDefined } from '@game/shared';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { Filter, Spritesheet } from 'pixi.js';
import { Hitbox } from '~/utils/hitbox';

const { cellId } = defineProps<{ cellId: CellId }>();

const { assets, ui, pathfinding, fx, camera } = useGame();
const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);

const diffuseTextures = computed(() => {
  const sheet = assets.getSpritesheet(cell.value.spriteId);

  return sheet.animations[0];
});

const normalSheet = ref<Spritesheet | null>(null);

onMounted(async () => {
  const diffuseSheet = assets.getSpritesheet(cell.value.spriteId);
  normalSheet.value = await assets.loadNormalSpritesheet(
    cell.value.spriteId,
    diffuseSheet
  );
});
const normalTextures = computed(() => {
  if (!normalSheet.value) return null;

  return normalSheet.value.animations[0];
});

const shape = assets.getHitbox('tile');
const hitArea = Hitbox.from(shape.shapes[0].points, shape.shapes[0].source, 0.5);

const targetedFilter = new ColorOverlayFilter(0xff0000, 0.5);

const filters = computed(() => {
  const result: Filter[] = [];
  if (fx.isPlaying.value) return result;
  // if (isMovePathHighlighted.value) result.push(pathFilter);
  if (
    ui.selectedEntity.value &&
    ui.hoveredCell.value?.equals(cell.value) &&
    ui.hoveredEntity.value?.isEnemy(ui.selectedEntity.value.id) &&
    ui.selectedEntity.value.canAttack(ui.hoveredEntity.value) &&
    ui.targetingMode.value === TARGETING_MODES.BASIC
  ) {
    result.push(targetedFilter);
  }

  if (
    ui.selectedSkill.value &&
    ui.selectedSkill.value?.isInAreaOfEffect(
      cell.value,
      [...ui.skillTargets.value, ui.hoveredCell.value?.position].filter(isDefined)
    )
  ) {
    result.push(targetedFilter);
  }

  return result;
});

const pathSheets = reactive<{
  diffuse: Nullable<SpritesheetWithAnimations>;
  normal: Nullable<SpritesheetWithAnimations>;
}>({
  diffuse: null,
  normal: null
});

const textureName = ref<'path-straight' | 'path-end' | 'path-turn'>('path-straight');

const loadPathSheet = async () => {
  const diffuse = assets.getSpritesheet(textureName.value);
  pathSheets.diffuse = diffuse;
  pathSheets.normal = await assets.loadNormalSpritesheet(textureName.value, diffuse);
};

const positionInPath = computed(() => {
  if (!ui.selectedEntity.value) return -1;
  const canMoveTo = pathfinding.canMoveTo(ui.selectedEntity.value, cell.value);
  if (!canMoveTo) return -1;

  return (
    pathfinding.movePath.value?.findIndex(vec => vec.equals(cell.value.position)) ?? -1
  );
});

const pathFrameTag = computed(() => {
  if (!pathfinding.movePath.value) return;
  if (positionInPath.value === -1) return;

  const step = pathfinding.movePath.value[positionInPath.value];
  const nextStep = pathfinding.movePath.value[positionInPath.value + 1];
  const prevStep =
    pathfinding.movePath.value[positionInPath.value - 1] ??
    ui.selectedEntity.value!.position;

  let tag = 0;

  const isStraight =
    !isDefined(nextStep) || nextStep.x === prevStep.x || nextStep.y === prevStep.y;
  if (isStraight) {
    if (prevStep.x < step.x) {
      tag = 0;
    } else if (prevStep.x > step.x) {
      tag = 2;
    } else if (prevStep.y < step.y) {
      tag = 1;
    } else if (prevStep.y > step.y) {
      tag = 3;
    }
  } else {
    const isHorizontal = step.y === prevStep.y;
    const isVertical = step.x === prevStep.x;

    if (
      (isHorizontal && prevStep.x < nextStep.x && prevStep.y < nextStep.y) ||
      (isVertical && nextStep.x < prevStep.x && nextStep.y < prevStep.y)
    ) {
      tag = 0;
    } else if (
      (isHorizontal && prevStep.x < nextStep.x && prevStep.y > nextStep.y) ||
      (isVertical && nextStep.x < prevStep.x && nextStep.y > prevStep.y)
    ) {
      tag = 1;
    } else if (
      (isHorizontal && prevStep.x > nextStep.x && prevStep.y > nextStep.y) ||
      (isVertical && nextStep.x > prevStep.x && nextStep.y > prevStep.y)
    ) {
      tag = 2;
    } else if (
      (isHorizontal && prevStep.x > nextStep.x && prevStep.y < nextStep.y) ||
      (isVertical && nextStep.x > prevStep.x && nextStep.y < prevStep.y)
    ) {
      tag = 3;
    }
  }

  const rotation = camera.angle.value / 90;
  return String((tag + rotation) % 4);
});

watchEffect(() => {
  if (!pathfinding.movePath.value) return;
  if (positionInPath.value === -1) return;
  if (positionInPath.value === pathfinding.movePath.value.length - 1) {
    textureName.value = 'path-end';
    return;
  }
  const nextStep = pathfinding.movePath.value[positionInPath.value + 1];
  const prevStep =
    pathfinding.movePath.value[positionInPath.value - 1] ??
    ui.selectedEntity.value!.position;
  const isStraight = nextStep.x === prevStep.x || nextStep.y === prevStep.y;
  textureName.value = isStraight ? 'path-straight' : 'path-turn';
});

watch(textureName, loadPathSheet);

const pathTextures = computed(() => {
  if (!pathSheets.diffuse || !pathSheets.normal || !isDefined(pathFrameTag.value)) return;

  // have to cast because of some vue unwrapping type issue
  return {
    diffuse: createSpritesheetFrameObject(
      pathFrameTag.value,
      pathSheets.diffuse as SpritesheetWithAnimations
    ),
    normal: createSpritesheetFrameObject(
      pathFrameTag.value,
      pathSheets.normal as SpritesheetWithAnimations
    )
  };
});

const children = computed(() => {
  return fx.cellChildSpritesMap.value.get(cellId);
});
</script>

<template>
  <IlluminatedSprite
    v-if="normalTextures"
    :diffuse-textures="diffuseTextures"
    :normal-textures="normalTextures"
    :anchor="0.5"
    :hit-area="hitArea"
    :filters="filters"
  />

  <IlluminatedSprite
    v-if="
      ui.selectedEntity.value?.canMove(1) &&
      pathTextures &&
      positionInPath >= 0 &&
      !fx.isPlaying.value
    "
    :diffuse-textures="pathTextures.diffuse"
    :normal-textures="pathTextures.normal"
    :anchor="0.5"
    event-mode="none"
  />

  <MapCellChild v-for="spriteId in children" :key="spriteId" :sprite-id="spriteId" />
</template>

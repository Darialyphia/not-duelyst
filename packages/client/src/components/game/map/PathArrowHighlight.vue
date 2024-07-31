<script setup lang="ts">
import { isAxisAligned } from '@game/sdk/src/utils/targeting';
import { type Nullable, isDefined } from '@game/shared';

const { cell } = defineProps<{ cell: CellViewModel }>();

const { assets, ui, pathfinding, fx, camera } = useGame();

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
  if (!ui.hoveredCell.value) return -1;
  const canMoveTo = pathfinding.canMoveTo(ui.selectedEntity.value, ui.hoveredCell.value);
  if (!canMoveTo) return -1;

  return pathfinding.movePath.value?.findIndex(vec => vec.equals(cell.position)) ?? -1;
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

  const isStraight = !isDefined(nextStep) || isAxisAligned(nextStep, prevStep);
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

  const isPathEnd = positionInPath.value === pathfinding.movePath.value.length - 1;
  if (isPathEnd) {
    textureName.value = 'path-end';
  } else {
    const nextStep = pathfinding.movePath.value[positionInPath.value + 1];
    const prevStep =
      pathfinding.movePath.value[positionInPath.value - 1] ??
      ui.selectedEntity.value!.position;
    const isStraight = isAxisAligned(nextStep, prevStep);
    textureName.value = isStraight ? 'path-straight' : 'path-turn';
  }
});

watch(textureName, loadPathSheet, { immediate: true });

const pathTextures = computed(() => {
  if (!pathSheets.diffuse || !pathSheets.normal || !isDefined(pathFrameTag.value)) return;

  // have to cast because of some vue unwrapping type issue
  return {
    diffuse: createSpritesheetFrameObject(
      pathFrameTag.value,
      pathSheets.diffuse as SpritesheetWithAnimations
    )
  };
});
</script>

<template>
  <animated-sprite
    v-if="
      ui.selectedEntity.value?.canMove(1) &&
      pathTextures &&
      positionInPath >= 0 &&
      !fx.isPlaying.value
    "
    :textures="pathTextures.diffuse"
    :anchor="0.5"
    event-mode="none"
  />
</template>

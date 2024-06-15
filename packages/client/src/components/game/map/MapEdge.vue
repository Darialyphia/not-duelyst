<script setup lang="ts">
import type { CellId } from '@game/sdk/src/board/cell';
import type { Spritesheet } from 'pixi.js';

const { cellId } = defineProps<{ cellId: CellId }>();

const { assets, camera, session } = useGame();
const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);
const cellAbove = computed(() =>
  session.boardSystem.getCellAt({
    x: cell.value.x,
    y: cell.value.y,
    z: cell.value.z + 1
  })
);
const edgeNormalSheet = ref<Spritesheet | null>(null);

const edgeDiffuseSheet = assets.getSpritesheet('map-edge');

onMounted(async () => {
  edgeNormalSheet.value = await assets.loadNormalSpritesheet(
    'map-edge',
    edgeDiffuseSheet
  );
});

const isTopEdge = computed(() => cell.value.position.y === 0);
const isBottomEdge = computed(() => {
  return cell.value.position.y === session.boardSystem.width - 1;
});
const isLeftEdge = computed(() => cell.value.position.x === 0);
const isRightEdge = computed(
  () => cell.value.position.x === session.boardSystem.height - 1
);
</script>

<template>
  <IlluminatedSprite
    v-if="!cellAbove && edgeNormalSheet && isTopEdge"
    :diffuse-textures="edgeDiffuseSheet.animations[0 + camera.angle.value]"
    :normal-textures="edgeNormalSheet.animations[0 + camera.angle.value]"
    :anchor="0.5"
    event-mode="none"
    :y="-14"
  />
  <IlluminatedSprite
    v-if="!cellAbove && edgeNormalSheet && isBottomEdge"
    :diffuse-textures="edgeDiffuseSheet.animations[180 + camera.angle.value]"
    :normal-textures="edgeNormalSheet.animations[180 + camera.angle.value]"
    :anchor="0.5"
    event-mode="none"
    :y="-14"
  />
  <IlluminatedSprite
    v-if="!cellAbove && edgeNormalSheet && isRightEdge"
    :diffuse-textures="edgeDiffuseSheet.animations[90 + camera.angle.value]"
    :normal-textures="edgeNormalSheet.animations[90 + camera.angle.value]"
    :anchor="0.5"
    event-mode="none"
    :y="-14"
  />
  <IlluminatedSprite
    v-if="!cellAbove && edgeNormalSheet && isLeftEdge"
    :diffuse-textures="edgeDiffuseSheet.animations[270 + camera.angle.value]"
    :normal-textures="edgeNormalSheet.animations[270 + camera.angle.value]"
    :anchor="0.5"
    event-mode="none"
    :y="-14"
  />
</template>

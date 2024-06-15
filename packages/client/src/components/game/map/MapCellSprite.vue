<script setup lang="ts">
import type { CellId } from '@game/sdk/src/board/cell';
import { isDefined } from '@game/shared';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { Filter, Spritesheet } from 'pixi.js';
import { Hitbox } from '~/utils/hitbox';

const { cellId } = defineProps<{ cellId: CellId }>();

const { assets, ui, fx, camera } = useGame();
const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);

const diffuseTextures = computed(() => {
  const sheet = assets.getSpritesheet(cell.value.spriteId);

  return sheet.animations[cell.value.defaultRotation + camera.angle.value];
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

  return normalSheet.value.animations[cell.value.defaultRotation + camera.angle.value];
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
    ui.hoveredCell.value &&
    ui.selectedSkill.value.isInAreaOfEffect(
      cell.value,
      [
        ...ui.skillTargets.value,
        ui.selectedSkill.value.isTargetable(ui.hoveredCell.value, ui.skillTargets.value)
          ? ui.hoveredCell.value?.position
          : null
      ].filter(isDefined)
    )
  ) {
    result.push(targetedFilter);
  }

  return result;
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
    :y="-14"
  />

  <MapEdge :cell-id="cellId" />

  <MapCellChild v-for="spriteId in children" :key="spriteId" :sprite-id="spriteId" />
</template>

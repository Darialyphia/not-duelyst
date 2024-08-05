<script setup lang="ts">
import { TERRAINS } from '@game/sdk';
import type { SerializedCell } from '@game/sdk/src/board/cell';
import { Vec3 } from '@game/shared';
import type { FrameObject } from 'pixi.js';
import { match } from 'ts-pattern';
import type { MapEditorLayer } from '~/composables/useMapEditor';

const cell = defineModel<Omit<SerializedCell, 'spriteId'>>('cell', { required: true });
const { layer } = defineProps<{ layer: MapEditorLayer }>();
const { dimensions, camera, assets, isPainting, tool, selectedLayer, getLayer, terrain } =
  useMapEditor();

const textures = ref<FrameObject[]>();

const spriteId = computed(() => {
  return match(cell.value.terrain)
    .with(TERRAINS.EMPTY, () => 'empty')
    .with(TERRAINS.WATER, () => 'water')
    .with(TERRAINS.GROUND, () => {
      const layerAbove = getLayer(cell.value.position.z + 1);
      if (!layerAbove) return 'grass';
      const cellAbove = layerAbove.cells.find(c =>
        Vec3.fromPoint3D(cell.value.position).equals(c.position)
      );
      return cellAbove ? 'dirt' : 'grass';
    })
    .exhaustive();
});
watchEffect(async () => {
  const spritesheet = await assets.loadSpritesheet(spriteId.value);
  textures.value = createSpritesheetFrameObject(
    `${cell.value.defaultRotation ?? 0 + camera.angle.value}`,
    spritesheet
  );
});

const shape = assets.getHitbox('tile');
const hitArea = Hitbox.from(shape.shapes[0].points, shape.shapes[0].source, {
  x: 0.5,
  y: 0.25
});

const applyCurrentTool = () => {
  match(tool.value)
    .with('add', () => {
      cell.value.terrain = terrain.value;
    })
    .with('remove', () => {
      cell.value.terrain = TERRAINS.EMPTY;
    })
    .with('move', () => {
      return;
    })
    .exhaustive();
};
</script>

<template>
  <IsoPositioner
    v-bind="cell.position"
    :width="dimensions.x.value"
    :height="dimensions.y.value"
    :angle="camera.angle.value"
    :animated="false"
    :alpha="layer.isVisible ? 1 : 0.1"
    :event-mode="selectedLayer === layer.floor ? 'static' : 'none'"
    @pointerenter="
      () => {
        if (cell.position.z !== selectedLayer) return;
        if (!isPainting) return;
        applyCurrentTool();
      }
    "
    @pointerdown="
      () => {
        if (cell.position.z !== selectedLayer) return;
        isPainting = true;
        applyCurrentTool();
      }
    "
  >
    <animated-sprite
      v-if="textures"
      :textures="textures"
      :anchor="0.5"
      :hit-area="hitArea"
      :y="-14"
    />
  </IsoPositioner>
</template>

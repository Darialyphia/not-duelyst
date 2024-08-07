<script setup lang="ts">
import { TERRAINS } from '@game/sdk';
import type { SerializedCell } from '@game/sdk/src/board/cell';
import { Vec3 } from '@game/shared';
import type { FrameObject } from 'pixi.js';
import { match } from 'ts-pattern';
import type { MapEditorLayer } from '~/composables/useMapEditor';

const cell = defineModel<Omit<SerializedCell, 'spriteId'>>('cell', { required: true });
const { layer } = defineProps<{ layer: MapEditorLayer }>();
const {
  dimensions,
  camera,
  assets,
  isPainting,
  tool,
  selectedLayer,
  getLayer,
  terrain,
  player1Position,
  player2Position,
  tileId
} = useMapEditor();

const textures = ref<FrameObject[]>();
const p1Texture = ref<FrameObject[]>();
const p2Texture = ref<FrameObject[]>();

const spriteId = computed(() => {
  return match(cell.value.terrain)
    .with(TERRAINS.EMPTY, () => 'empty')
    .with(TERRAINS.WATER, () => 'water')
    .with(TERRAINS.GROUND, () => {
      const layerAbove = getLayer(cell.value.position.z + 1);
      if (!layerAbove) return 'grass';
      const cellAbove = layerAbove.cells.find(c =>
        Vec3.fromPoint3D({ ...cell.value.position, z: cell.value.position.z + 1 }).equals(
          c.position
        )
      );
      if (!cellAbove) return 'grass';

      return cellAbove.terrain === TERRAINS.EMPTY ? 'grass' : 'dirt';
    })
    .exhaustive();
});

watchEffect(async () => {
  const spritesheet = await assets.loadSpritesheet(spriteId.value);
  const p1Spritesheet = await assets.loadSpritesheet('P1-start');
  const p2Spritesheet = await assets.loadSpritesheet('P2-start');
  textures.value = createSpritesheetFrameObject(
    `${cell.value.defaultRotation ?? 0 + camera.angle.value}`,
    spritesheet
  );
  p1Texture.value = createSpritesheetFrameObject(`${camera.angle.value}`, p1Spritesheet);
  p2Texture.value = createSpritesheetFrameObject(`${camera.angle.value}`, p2Spritesheet);
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
      cell.value.tileBlueprintId = null;
    })
    .with('move', () => {
      return;
    })
    .with('p1Start', () => {
      player1Position.value = { ...cell.value.position };
    })
    .with('p2Start', () => {
      player2Position.value = { ...cell.value.position };
    })
    .with('tile', () => {
      cell.value.tileBlueprintId = tileId.value;
    })
    .exhaustive();
};

const isP1Start = computed(() =>
  Vec3.fromPoint3D(cell.value.position).equals(player1Position.value)
);
const isP2Start = computed(() =>
  Vec3.fromPoint3D(cell.value.position).equals(player2Position.value)
);

const alpha = computed(() => {
  const isSelected = cell.value.position.z === selectedLayer.value;
  if (!isSelected && cell.value.terrain === TERRAINS.EMPTY) return 0;

  return layer.isVisible ? 1 : 0.25;
});
</script>

<template>
  <IsoPositioner
    v-bind="cell.position"
    :width="dimensions.x.value"
    :height="dimensions.y.value"
    :angle="camera.angle.value"
    :animated="false"
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
      :alpha="alpha"
      :y="-14"
    />
    <animated-sprite
      v-if="p1Texture && isP1Start"
      :textures="p1Texture"
      :anchor="0.5"
      :y="-14"
      event-mode="none"
    />
    <animated-sprite
      v-if="p2Texture && isP2Start"
      :textures="p2Texture"
      :anchor="0.5"
      :y="-14"
      event-mode="none"
    />
  </IsoPositioner>

  <MapEditorTile
    v-if="cell.tileBlueprintId"
    :position="cell.position"
    :tile-id="cell.tileBlueprintId"
  />
</template>

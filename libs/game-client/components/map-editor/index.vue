<script setup lang="ts">
import { Application } from 'vue3-pixi';
import * as PIXI from 'pixi.js';
import { Cell, Tile, type Point3D } from '@hc/sdk';
import PixiPlugin from 'gsap/PixiPlugin';
import MotionPathPlugin from 'gsap/MotionPathPlugin';
import { tileImagesPaths } from '../../assets/tiles';

gsap.registerPlugin(PixiPlugin);
gsap.registerPlugin(MotionPathPlugin);

gsap.install(window);

// @ts-ignore  enable PIXI devtools
window.PIXI = PIXI;
const map = ref<{
  width: number;
  height: number;
  cells: Cell[];
  startPositions: [Point3D, Point3D];
}>({
  width: 10,
  height: 10,
  cells: Array.from({ length: 10 }, (_, y) =>
    Array.from({ length: 10 }, (_, x) => ({
      position: { x, y, z: 0 },
      tileId: 'ground',
      spriteIds: ['editor-empty-tile']
    }))
  )
    .flat()
    .map(cell => new Cell(new Tile(cell.tileId), cell.position, cell.spriteIds)),
  startPositions: [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 }
  ]
});
const { history, undo, redo } = useRefHistory(map, { capacity: 100, deep: true });

const canvasContainer = ref<HTMLElement>();

const assets = useAssetsProvider();
const isReady = ref(false);
assets.load().then(() => {
  isReady.value = true;
});

const rotation = ref<0 | 90 | 180 | 270>(0);

const selectedTile = ref<string | null>(null);

const isCtrlKeyPressed = ref(false);
const isShiftKeyPressed = ref(false);
onMounted(() => {
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.code === 'KeyW' && !e.repeat) {
      undo();
      return;
    }
    if (e.ctrlKey && e.code === 'KeyY' && !e.repeat) {
      return redo();
    }
    if (e.code === 'ControlLeft') {
      isCtrlKeyPressed.value = true;
    }
    if (e.code === 'ShiftLeft') {
      isShiftKeyPressed.value = true;
    }

    if (e.code === 'KeyQ')
      rotation.value = ((rotation.value + 360 - 90) % 360) as 0 | 90 | 180 | 270;

    if (e.code === 'KeyE')
      rotation.value = ((rotation.value + 360 + 90) % 360) as 0 | 90 | 180 | 270;
  });
  window.addEventListener('keyup', () => {
    isCtrlKeyPressed.value = false;
    isShiftKeyPressed.value = false;
  });
});

const mode = ref<'add' | 'remove'>('add');

const onCellClick = (cell: Cell) => {
  switch (mode.value) {
    case 'add':
      return addTile(cell);
    case 'remove':
      return removeTile(cell);
  }
};

const addTile = (cell: Cell) => {
  if (isShiftKeyPressed.value) return removeTile(cell);
  if (!selectedTile.value) return;
  cell.spriteIds = cell.spriteIds.filter(id => id !== 'editor-empty-tile');
  if (!isCtrlKeyPressed.value) {
    const idx = cell.spriteIds.indexOf(selectedTile.value);
    if (cell.spriteIds.includes(selectedTile.value)) {
      cell.spriteIds.splice(idx, 1);
    } else {
      cell.spriteIds.push(selectedTile.value);
    }
  } else {
    const coords = { x: cell.x, y: cell.y, z: cell.z + 1 };
    let exists = map.value.cells.find(c => c.position.equals(coords));
    while (exists) {
      coords.z++;
      exists = map.value.cells.find(c => c.position.equals(coords));
    }

    map.value.cells.push(new Cell(new Tile('ground'), coords, [selectedTile.value]));
  }
};

const removeTile = (cell: Cell) => {
  if (cell.z === 0) {
    cell.spriteIds = ['editor-empty-tile'];
    return;
  }

  map.value.cells = map.value.cells.filter(c => !c.position.equals(cell.position));
};
</script>

<template>
  <div class="map-editor">
    <header class="flex gap-3">
      <UiButton>New map</UiButton>
      <UiButton>Load map</UiButton>

      <UiButton
        :style="{ '--d-button-size': 'var(--font-size-4)', transform: 'rotateY(180deg)' }"
        @click="
          () => {
            rotation = ((rotation + 360 - 90) % 360) as 0 | 90 | 180 | 270;
          }
        "
      >
        <Icon name="mdi:rotate-360" />
      </UiButton>
      <UiButton
        :style="{ '--d-button-size': 'var(--font-size-4)' }"
        @click="
          () => {
            rotation = ((rotation + 360 + 90) % 360) as 0 | 90 | 180 | 270;
          }
        "
      >
        <Icon name="mdi:rotate-360" />
      </UiButton>
      <UiButton :style="{ '--d-button-size': 'var(--font-size-4)' }" @click="undo">
        <Icon name="mdi:undo" />
      </UiButton>
      <UiButton :style="{ '--d-button-size': 'var(--font-size-4)' }" @click="redo">
        <Icon name="mdi:redo" />
      </UiButton>
      <UiButton
        :style="{ '--d-button-size': 'var(--font-size-4)' }"
        :class="mode === 'add' && 'selected'"
        @click="mode = 'add'"
      >
        <Icon name="material-symbols:edit-outline" />
      </UiButton>
      <UiButton
        :style="{ '--d-button-size': 'var(--font-size-4)' }"
        :class="mode === 'remove' && 'selected'"
        @click="mode = 'remove'"
      >
        <Icon name="bi:eraser-fill" />
      </UiButton>
    </header>

    <aside class="surface">
      <h2>Tiles</h2>
      <section class="tile-selector">
        <button
          v-for="(src, name) in tileImagesPaths"
          :key="name"
          :style="{ '--bg': `url(${src})` }"
          :class="selectedTile === name && 'selected'"
          @click="selectedTile = name as string"
        />
      </section>
    </aside>
    <main ref="canvasContainer" @contextmenu.prevent>
      <Application :resize-to="canvasContainer" :antialias="false" v-if="isReady">
        <MapEditorRenderer
          v-model:map="map"
          :assets="assets"
          :rotation="rotation"
          @cell-click="onCellClick"
        />
      </Application>
    </main>
  </div>
</template>

<style scoped lang="postcss">
button {
  cursor: pointer;
  &.selected {
    outline: solid var(--border-size-2) var(--primary);
  }
}
.map-editor {
  overflow: hidden;
  display: grid;
  grid-template-columns: var(--size-xs) 1fr;
  grid-template-rows: auto 1fr;

  height: 100vh;
}

header {
  grid-column: 1 / -1;
  padding: var(--size-2);
}

h2 {
  margin-block-end: var(--size-3);
  font-size: var(--font-size-2);
  font-weight: var(--font-size-5);
}

.tile-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-3);

  > button {
    cursor: pointer;

    aspect-ratio: 1;
    width: 64px;

    background-image: var(--bg);
    background-position: -16px -16px;
    &:hover {
      filter: brightness(120%);
    }
  }
}
</style>

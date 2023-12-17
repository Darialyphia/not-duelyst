<script setup lang="ts">
import { Application } from 'vue3-pixi';
import * as PIXI from 'pixi.js';
import { Cell, Tile, type Point3D, Vec3 } from '@hc/sdk';
import { isString, isDefined } from '@hc/shared';
import PixiPlugin from 'gsap/PixiPlugin';
import MotionPathPlugin from 'gsap/MotionPathPlugin';
import { tileImagesPaths } from '../../assets/tiles';

gsap.registerPlugin(PixiPlugin);
gsap.registerPlugin(MotionPathPlugin);

gsap.install(window);

// @ts-ignore  enable PIXI devtools
window.PIXI = PIXI;
const MAX_HEIGHT = 8;
const map = ref<{
  width: number;
  height: number;
  cells: Cell[];
  startPositions: [Point3D, Point3D];
}>({
  width: 11,
  height: 13,
  cells: Array.from({ length: 13 }, (_, y) =>
    Array.from({ length: 11 }, (_, x) => ({
      position: { x, y, z: 0 },
      tileId: 'ground',
      spriteIds: []
    }))
  )
    .flat()
    .map(cell => new Cell(new Tile(cell.tileId), cell.position, cell.spriteIds)),
  startPositions: [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 }
  ]
});
const { undo, redo } = useRefHistory(map, { capacity: 100, deep: true });

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
const isAltKeyPressed = ref(false);
const isPlacingPlayer1 = ref(false);
const isPlacingPlayer2 = ref(false);

onMounted(() => {
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.code === 'KeyW') {
      undo();
      return;
    }
    if (e.ctrlKey && e.code === 'KeyY') {
      return redo();
    }
    if (e.code === 'ControlLeft') {
      isCtrlKeyPressed.value = true;
    }
    if (e.code === 'ShiftLeft') {
      isShiftKeyPressed.value = true;
    }
    if (e.code === 'AltLeft') {
      isAltKeyPressed.value = true;
    }

    if (e.code === 'KeyQ')
      rotation.value = ((rotation.value + 360 - 90) % 360) as 0 | 90 | 180 | 270;

    if (e.code === 'KeyE')
      rotation.value = ((rotation.value + 360 + 90) % 360) as 0 | 90 | 180 | 270;
  });
  window.addEventListener('keyup', () => {
    isCtrlKeyPressed.value = false;
    isShiftKeyPressed.value = false;
    isAltKeyPressed.value = false;
  });
});

const mode = ref<'add' | 'remove'>('add');

const onCellPointerdown = (cell: Cell) => {
  if (isPlacingPlayer1.value || isPlacingPlayer2.value) return;

  isDragging.value = true;
  switch (mode.value) {
    case 'add':
      return addTile(cell);
    case 'remove':
      return removeTile(cell);
  }
};

const onCellPointerenter = (cell: Cell) => {
  if (!isDragging.value) return;
  switch (mode.value) {
    case 'add':
      return addTile(cell);
    case 'remove':
      return removeTile(cell);
  }
};

const onCellPointerup = (cell: Cell) => {
  isDragging.value = false;
  if (isPlacingPlayer1.value) {
    map.value.startPositions[0] = cell.position.serialize();
  }
  if (isPlacingPlayer2.value) {
    map.value.startPositions[1] = cell.position.serialize();
  }
};

const isDragging = ref(false);

const addTile = (cell: Cell) => {
  if (isCtrlKeyPressed.value) return removeTile(cell);
  if (!selectedTile.value) return;

  // try to pile up new cell on top
  if (isShiftKeyPressed.value) {
    const coords = { x: cell.x, y: cell.y, z: cell.z + 1 };
    let existingCell = map.value.cells.find(c =>
      // vueuse's useRefHistory deserialized class instances son undo >_<
      Vec3.fromPoint3D(c.position).equals(coords)
    );
    while (existingCell && existingCell.spriteIds.length) {
      coords.z++;
      existingCell = map.value.cells.find(c => c.position.equals(coords));
    }

    if (coords.z >= MAX_HEIGHT) return;
    if (existingCell) {
      existingCell.spriteIds.push(selectedTile.value);
    } else {
      map.value.cells.push(new Cell(new Tile('ground'), coords, [selectedTile.value]));
    }
    // toggle sprite presence on the cell
  } else if (isAltKeyPressed.value) {
    const idx = cell.spriteIds.indexOf(selectedTile.value);
    if (idx >= 0) {
      cell.spriteIds.splice(idx, 1);
    } else if (idx < 0) {
      cell.spriteIds.push(selectedTile.value);
    }
    // replace the cell sprites
  } else {
    cell.spriteIds = [selectedTile.value];
  }
};

const removeTile = (cell: Cell) => {
  if (cell.z === 0) {
    cell.spriteIds = [];
    return;
  }

  map.value.cells = map.value.cells.filter(c => !c.position.equals(cell.position));
};

const visibleFloors = ref<Record<number, boolean>>({ 0: true });

watchEffect(() => {
  map.value.cells.forEach(cell => {
    if (!isDefined(visibleFloors.value[cell.position.z])) {
      visibleFloors.value[cell.position.z] = true;
    }
  });
});
</script>

<template>
  <div class="map-editor">
    <header class="flex gap-3">
      <UiButton>New map</UiButton>
      <UiButton>Load</UiButton>
      <UiButton>Save</UiButton>

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
      <UiButton
        @click="
          () => {
            isPlacingPlayer1 = true;
            isPlacingPlayer2 = false;
          }
        "
      >
        Player 1
      </UiButton>
      <UiButton
        @click="
          () => {
            isPlacingPlayer1 = false;
            isPlacingPlayer2 = true;
          }
        "
      >
        Player 2
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
          @click="
            () => {
              if (isString(name)) selectedTile = name;
            }
          "
        />
      </section>

      <section>
        <h2>Visible floors</h2>
        <fieldset class="floors">
          <label v-for="(_, floor) in visibleFloors">
            <input type="checkbox" v-model="visibleFloors[floor]" />
            Floor {{ floor }}
          </label>
        </fieldset>
      </section>
    </aside>
    <main ref="canvasContainer" @contextmenu.prevent>
      <Application :resize-to="canvasContainer" :antialias="false" v-if="isReady">
        <MapEditorRenderer
          v-model:map="map"
          :assets="assets"
          :rotation="rotation"
          @cell-pointerup="onCellPointerup"
          @cell-pointerdown="onCellPointerdown"
          @cell-pointerenter="onCellPointerenter"
          :visible-floors="visibleFloors"
        />
      </Application>

      <div class="help surface">
        <code>Click: replace / remove sprites on cell</code>
        <code>
          <kbd>Ctrl</kbd>
          + click : remove sprites on cell
        </code>
        <code>
          <kbd>Shift</kbd>
          + click : add new cell
        </code>
        <code>
          <kbd>Alt</kbd>
          + click: toggle sprite on cell
        </code>
      </div>
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

section {
  margin-block-end: var(--size-3);
}

h2 {
  margin-block-end: var(--size-2);
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

main {
  position: relative;
}

.help {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0;
  code {
    display: block;

    padding-block: var(--size-1);
    padding-inline: var(--size-3);

    font-size: var(--font-size-0);

    background: transparent;
    &:first-of-type {
      padding-block-start: var(--size-3);
    }
    &:last-of-type {
      padding-block-end: var(--size-3);
    }
  }
}

label {
  display: block;
  margin-block-end: var(--size-1);
}

.floors {
  display: flex;
  flex-direction: column-reverse;
}
</style>

<script setup lang="ts">
import { Application, BaseTexture, SCALE_MODES, WRAP_MODES } from 'pixi.js';
import { appInjectKey, createApp } from 'vue3-pixi';
import * as PIXI from 'pixi.js';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Stage } from '@pixi/layers';
import cursorUrl from '@/assets/cursors/cursor.png';
import cursorDisabledUrl from '@/assets/cursors/cursor_disabled.png';
import cursorAttackUrl from '@/assets/cursors/cursor_attack.png';
import cursorMoveUrl from '@/assets/cursors/cursor_move.png';
import cursorSummonUrl from '@/assets/cursors/cursor_summon.png';
import MapEditorView from './MapEditorView.vue';
import UiTextInput from '~/components/ui/UiTextInput.vue';
import UiIconButton from '~/components/ui/UiIconButton.vue';
import UiSimpleTooltip from '~/components/ui/UiSimpleTooltip.vue';
import { TERRAINS } from '@game/sdk';

const settings = useUserSettings();

// @ts-ignore  enable PIXI devtools
window.PIXI = PIXI;
gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(PixiPlugin);
gsap.install(window);

const editor = useMapEditorProvider();

const cursors = {
  default: `url('${cursorUrl}'), auto`,
  disabled: `url('${cursorDisabledUrl}'), auto`,
  attack: `url('${cursorAttackUrl}'), auto`,
  move: `url('${cursorMoveUrl}'), auto`,
  summon: `url('${cursorSummonUrl}'), auto`
};

const canvas = ref<HTMLCanvasElement>();
const assets = useAssets();
onMounted(async () => {
  // We create the pixi app manually instead of using vue3-pixi's <Application /> component
  // because we want to be able to provide a bunch of stuff so we need access to the underlying vue-pixi app
  // and we can forward the providers to it
  const pixiApp = new Application({
    view: canvas.value,
    width: window.innerWidth,
    height: window.innerHeight,
    autoDensity: true,
    antialias: false
    // backgroundAlpha: 0
  });

  pixiApp.resizeTo = window;
  pixiApp.renderer.events.cursorStyles = cursors;

  pixiApp.stage = new Stage();
  pixiApp.stage.sortableChildren = true;

  if (import.meta.env.DEV) {
    // @ts-ignore  enable PIXI devtools
    window.__PIXI_APP__ = pixiApp;
  }

  BaseTexture.defaultOptions.wrapMode = WRAP_MODES.CLAMP;
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

  const app = createApp(MapEditorView);
  app.provide(appInjectKey, pixiApp);
  app.provide(MAP_EDITOR_INJECTION_KEY, editor);
  app.provide(ASSETS_INJECTION_KEY, assets);
  app.provide(USER_SETTINGS_INJECTION_KEY, settings);
  const { appContext } = getCurrentInstance()!;

  const parent = appContext?.app;
  app.config.globalProperties = parent.config.globalProperties;
  Object.assign(app._context.provides, parent._context.provides);

  await until(assets.loaded).toBe(true);
  await until(settings.settings).toBeTruthy();

  app.mount(pixiApp.stage);
});
</script>

<template>
  <div class="map-editor">
    <aside>
      <h3>Dimensions</h3>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <label for="dimensions-x">X</label>
          <UiTextInput
            id="dimensions-x"
            v-model.number="editor.dimensions.x.value"
            type="number"
            min="2"
            step="1"
          />
        </div>
        <div class="flex items-center gap-2">
          <label for="dimensions-y">Y</label>
          <UiTextInput
            id="dimensions-y"
            v-model.number="editor.dimensions.y.value"
            type="number"
            min="2"
            step="1"
          />
        </div>
      </div>

      <h3>Tools</h3>
      <div class="toolbar">
        <UiSimpleTooltip text="Move camera">
          <UiIconButton
            name="mdi:cursor-move"
            class="primary-button"
            :class="editor.tool.value === 'move' && 'selected'"
            @click="editor.tool.value = 'move'"
          />
        </UiSimpleTooltip>
        <UiSimpleTooltip text="Add tiles">
          <UiIconButton
            name="material-symbols:edit"
            class="primary-button"
            :class="editor.tool.value === 'add' && 'selected'"
            @click="editor.tool.value = 'add'"
          />
        </UiSimpleTooltip>

        <UiSimpleTooltip text="Remove tiles">
          <UiIconButton
            name="mdi:eraser"
            class="primary-button"
            :class="editor.tool.value === 'remove' && 'selected'"
            @click="editor.tool.value = 'remove'"
          />
        </UiSimpleTooltip>
      </div>

      <h3>Terrain</h3>
      <label>
        <input v-model="editor.terrain.value" type="radio" :value="TERRAINS.GROUND" />
        Ground
      </label>
      <label>
        <input v-model="editor.terrain.value" type="radio" :value="TERRAINS.WATER" />
        Water
      </label>
      <h3>Floors</h3>
      <ul>
        <li
          v-for="layer in editor.layers.value"
          :key="layer.floor"
          class=""
          :class="layer.floor === editor.selectedLayer.value && 'selected'"
        >
          <UiCheckbox v-model:checked="layer.isVisible" />
          <div class="flex-1" @click="editor.selectedLayer.value = layer.floor">
            Floor {{ layer.floor }}
          </div>
          <UiIconButton
            v-if="layer.floor > 0"
            name="material-symbols:delete"
            class="error-button ml-auto"
            @click="editor.removeLayer(layer.floor)"
          />
        </li>
      </ul>
      <UiButton
        class="primary-button mt-3"
        left-icon="mdi:add"
        @click="editor.addLayer()"
      >
        Add Layer
      </UiButton>
    </aside>
    <canvas ref="canvas" />
  </div>
</template>

<style scoped lang="postcss">
.map-editor {
  cursor: v-bind('cursors.default');
  user-select: none;

  position: relative;
  transform-style: preserve-3d;

  overflow: hidden;
  display: grid;
  grid-template-columns: var(--size-xs) 1fr;
  gap: var(--size-6);

  height: 100%;

  color: var(--gray-0);

  perspective: 1200px;

  image-rendering: pixelated;
}

h3 {
  margin-block: var(--size-5) var(--size-3);
  &:first-of-type {
    margin-block-start: 0;
  }
}

.toolbar {
  --ui-icon-button-size: var(--font-size-4);

  display: flex;
  gap: var(--size-3);
  align-items: center;
  padding-inline: var(--size-3);

  button:not(.selected) {
    filter: brightness(70%);
  }

  button.selected {
    transform: scale(1.15);
  }
}

li {
  display: flex;
  gap: var(--size-3);
  align-items: center;

  margin-block: var(--size-2);
  padding: var(--size-2);

  &.selected {
    background-color: hsl(var(--color-primary-hsl) / 0.3);
  }
}
</style>

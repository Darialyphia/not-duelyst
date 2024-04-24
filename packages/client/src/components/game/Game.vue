<script setup lang="ts">
import { Application, BaseTexture, SCALE_MODES, WRAP_MODES } from 'pixi.js';
import { appInjectKey, createApp } from 'vue3-pixi';
import * as PIXI from 'pixi.js';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import GameView from './GameView.vue';
import { Stage } from '@pixi/layers';
import type { GameSession } from '@game/sdk';
// import type { GameEmits } from '../../composables/useGame';
// import cursorUrl from '../../assets/cursors/cursor.png';
// import cursorDisabledUrl from '../../assets/cursors/cursor_disabled.png';
// import cursorAttackUrl from '../../assets/cursors/cursor_attack.png';
// import cursorMoveUrl from '../../assets/cursors/cursor_move.png';
// import cursorSummonUrl from '../../assets/cursors/cursor_summon.png';
import type { GameEmits, GameType } from '#imports';

const { gameSession, playerId, gameType } = defineProps<{
  gameSession: GameSession;
  playerId: string | null;
  gameType: GameType;
  // isReplay?: boolean;
}>();
const emit = defineEmits<GameEmits>();

const game = useGameProvider({ session: gameSession, emit, playerId, gameType });
// const { ui, assets } = game;

// @ts-ignore  enable PIXI devtools
window.PIXI = PIXI;
gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(PixiPlugin);
gsap.install(window);

// const cursors = {
//   default: `url('${cursorUrl}'), auto`,
//   disabled: `url('${cursorDisabledUrl}'), auto`,
//   attack: `url('${cursorAttackUrl}'), auto`,
//   move: `url('${cursorMoveUrl}'), auto`,
//   summon: `url('${cursorSummonUrl}'), auto`
// };

const canvas = ref<HTMLCanvasElement>();
const ready = ref(false);
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
  });

  pixiApp.resizeTo = window;
  // pixiApp.renderer.events.cursorStyles = cursors;

  pixiApp.stage = new Stage();
  pixiApp.stage.sortableChildren = true;

  if (import.meta.env.DEV) {
    // @ts-ignore  enable PIXI devtools
    window.__PIXI_APP__ = pixiApp;
  }

  BaseTexture.defaultOptions.wrapMode = WRAP_MODES.CLAMP;
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

  const app = createApp(GameView);
  app.provide(appInjectKey, pixiApp);
  app.provide(GAME_INJECTION_KEY, game);
  app.provide(ASSETS_INJECTION_KEY, game.assets);
  const { appContext } = getCurrentInstance()!;

  const parent = appContext?.app;
  app.config.globalProperties = parent.config.globalProperties;
  Object.assign(app._context.provides, parent._context.provides);

  gameSession.onReady(async () => {
    await game.assets.load();
    // we only load the spritesheets we need for the cards because there are way too many of them !
    await Promise.all(
      [
        ...new Set(
          gameSession.playerSystem
            .getList()
            .map(player => player.cards)
            .flat()
            .map(card => card.blueprint.spriteId)
        )
      ].map(spriteId => {
        return game.assets.loadSpritesheet(spriteId);
      })
    );

    ready.value = true;
    app.mount(pixiApp.stage);
  });
});
</script>

<template>
  <div class="pixi-app-container">
    <canvas ref="canvas" @contextmenu.prevent />
    <GameUi v-if="ready" />
  </div>
</template>

<style scoped lang="postcss">
.pixi-app-container {
  /* cursor: v-bind('cursors.default'); */
  user-select: none;

  position: relative;
  transform-style: preserve-3d;

  overflow: hidden;

  height: 100vh;

  font-family: monospace;
  color: var(--gray-0);

  perspective: 1200px;

  image-rendering: pixelated;
}
</style>

<script setup lang="ts">
import { Application, BaseTexture, SCALE_MODES, WRAP_MODES } from 'pixi.js';
import { appInjectKey, createApp } from 'vue3-pixi';
import * as PIXI from 'pixi.js';
import PixiPlugin from 'gsap/PixiPlugin';
import MotionPathPlugin from 'gsap/MotionPathPlugin';
import PixiRenderer from './PixiRenderer.vue';
import { Stage } from '@pixi/layers';
import type { GameSession } from '@hc/sdk';
import type { GameEmits } from '../../composables/useGame';
import cursorUrl from '../../assets/cursors/cursor.png';
import cursorDisabledUrl from '../../assets/cursors/cursor_disabled.png';
import cursorAttackUrl from '../../assets/cursors/cursor_attack.png';
import cursorMoveUrl from '../../assets/cursors/cursor_move.png';
import cursorSummonUrl from '../../assets/cursors/cursor_summon.png';

const { gameSession } = defineProps<{ gameSession: GameSession }>();
const emit = defineEmits<GameEmits>();

const game = useGameProvider(gameSession, emit);
const { state, ui, mapRotation, assets } = game;

const activePlayer = computed(
  () => gameSession.playerManager.getPlayerById(state.value.activeEntity.playerId)!
);

// @ts-ignore  enable PIXI devtools
window.PIXI = PIXI;
gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(PixiPlugin);
gsap.install(window);

const cursors = {
  default: `url('${cursorUrl}'), auto`,
  disabled: `url('${cursorDisabledUrl}'), auto`,
  attack: `url('${cursorAttackUrl}'), auto`,
  move: `url('${cursorMoveUrl}'), auto`,
  summon: `url('${cursorSummonUrl}'), auto`
};

const canvas = ref<HTMLCanvasElement>();

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
  pixiApp.renderer.events.cursorStyles = cursors;

  pixiApp.stage = new Stage();
  pixiApp.stage.sortableChildren = true;

  if (import.meta.env.DEV) {
    // @ts-ignore  enable PIXI devtools
    window.__PIXI_APP__ = pixiApp;
  }

  BaseTexture.defaultOptions.wrapMode = WRAP_MODES.CLAMP;
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

  const app = createApp(PixiRenderer);
  app.provide(appInjectKey, pixiApp);
  app.provide(GAME_INJECTION_KEY, game);

  await assets.load();
  app.mount(pixiApp.stage);
});

const rotateMap = (diff: number) => {
  mapRotation.value = ((mapRotation.value + 360 + diff) % 360) as any;
};

const setTargetMode = (mode: (typeof ui)['targetMode']['value']) => {
  ui.targetMode.value = mode;
};
</script>

<template>
  <div class="pixi-app-container">
    <canvas
      ref="canvas"
      @contextmenu.prevent="
        e => {
          ui.targetMode.value = null;
          ui.selectedSkill.value = null;
          ui.selectedSummon.value = null;
        }
      "
    />
    <GameUi />
    <!-- <header>
      <button
        @click="
          () => {
            console.log({ gameSession, state });
          }
        "
      >
        Debug
      </button>
      <button @click="rotateMap(90)">Rotate CW</button>
      <button @click="rotateMap(-90)">Rotate CCW</button>

      <button @click="emit('end-turn')">End turn</button>
      <button @click="setTargetMode('move')">Move</button>
      Skills
      <button
        v-for="skill in state.activeEntity.skills"
        :key="skill.id"
        :disabled="!state.activeEntity.canUseSkill(skill)"
        @click="ui.selectedSkill.value = skill"
      >
        {{ skill.id }} ({{ skill.cost }})
        {{ state.activeEntity.skillCooldowns[skill.id] }}
      </button>
      Loadout
      <template v-if="state.activeEntity.kind === 'GENERAL'">
        <button
          v-for="unit in activePlayer.summonableUnits"
          :disabled="!activePlayer.canSummon(unit.unit.id)"
          @click="ui.selectedSummon.value = unit.unit"
        >
          {{ unit.unit.id }} ({{ unit.unit.summonCost }})
        </button>
      </template>
    </header> -->
  </div>
</template>

<style scoped lang="postcss">
.pixi-app-container {
  cursor: v-bind('cursors.default');
  user-select: none;

  position: relative;

  overflow: hidden;

  font-family: monospace;
  color: var(--gray-0);
}

.pixi-app-container :is(button, input) {
  cursor: inherit !important;

  &:disabled {
    cursor: v-bind('cursors.disabled') !important;
  }
}

header {
  position: absolute;
  top: 0;
  left: 0;

  display: flex;
  gap: var(--size-3);
  align-items: center;

  width: 100%;
  padding-block: var(--size-3);
}

button {
  padding: var(--size-2) var(--size-3);
  color: white;
  background-color: var(--blue-7);
  border-radius: var(--radius-1);

  &:hover {
    background-color: var(--blue-8);
  }
  &:disabled {
    opacity: 0.5;
  }
}
</style>

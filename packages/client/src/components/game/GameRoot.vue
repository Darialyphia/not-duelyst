<script setup lang="ts">
import { Application, BaseTexture, SCALE_MODES, WRAP_MODES } from 'pixi.js';
import { appInjectKey, createApp } from 'vue3-pixi';
import * as PIXI from 'pixi.js';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import GameView from './GameView.vue';
import { Stage } from '@pixi/layers';
import {
  CARDS,
  type ClientSession,
  type SimulationResult,
  type TutorialStep,
  type Unit
} from '@game/sdk';
// import type { GameEmits } from '../../composables/useGame';
import cursorUrl from '../../assets/cursors/cursor.png';
import cursorDisabledUrl from '../../assets/cursors/cursor_disabled.png';
import cursorAttackUrl from '../../assets/cursors/cursor_attack.png';
import cursorMoveUrl from '../../assets/cursors/cursor_move.png';
import cursorSummonUrl from '../../assets/cursors/cursor_summon.png';
import type { GameEmits, GameType } from '#imports';
import { randomInt, type Nullable } from '@game/shared';

const { gameSession, playerId, gameType, p1Emote, p2Emote, currentTutorialStep } =
  defineProps<{
    gameSession: ClientSession;
    playerId: string | null;
    gameType: GameType;
    p1Emote: Nullable<string>;
    p2Emote: Nullable<string>;
    currentTutorialStep?: TutorialStep;
  }>();

const simulationResult = defineModel<Nullable<SimulationResult>>('simulationResult', {
  required: false
});
const emit = defineEmits<GameEmits & { ready: [] }>();

const bgm = useBgm();
const battleBgms = [BGMS.BATTLE, BGMS.BATTLE2, BGMS.BATTLE3, BGMS.BATTLE4];
const musicIndex = randomInt(battleBgms.length - 1);

const game = useGameProvider({
  session: gameSession,
  emit,
  playerId,
  gameType: computed(() => gameType),
  p1Emote: computed(() => p1Emote),
  p2Emote: computed(() => p2Emote),
  currentTutorialStep: computed(() => currentTutorialStep),
  simulationResult
});

const settings = useUserSettings();

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
const ready = ref(false);
const assets = useAssets();

const generals = computed(() => {
  const players = gameSession.playerSystem.getList();
  const p1 = players.find(p => p.isPlayer1);

  return [p1!.general.card, p1?.opponent.general.card] as [Unit, Unit];
});

const p1Sound = useSoundEffect(
  `sfx_announcer_${generals.value[0].blueprint.faction?.name.toLocaleLowerCase()}_1st.m4a`
);
const versusSound = useSoundEffect('sfx_announcer_versus.m4a');
const p2Sound = useSoundEffect(
  `sfx_announcer_${generals.value[1].blueprint.faction?.name.toLocaleLowerCase()}_2nd.m4a`
);

const durations = [p1Sound, versusSound, p2Sound].map(
  sound =>
    new Promise<number>(resolve => {
      // load even doesnt fire after your first game since it was already loaded !
      const duration = sound.duration();
      if (duration !== 0) return resolve(duration);

      sound.once('load', () => {
        // duration is only available once 'load' fires
        resolve(sound.duration());
      });
    })
);

const wait = (duration: number) =>
  new Promise(res => {
    setTimeout(res, duration);
  });
const playSoundSequence = () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async resolve => {
    const [p1Duration, versusDuration, p2Duration] = await Promise.all(durations);
    p1Sound.play();
    await wait(p1Duration * 333);
    versusSound.play();
    await wait(versusDuration * 333);
    p2Sound.play();
    await wait(p2Duration * 500);
    resolve();
  });
};
onMounted(async () => {
  const soundSequence = playSoundSequence();
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

  const app = createApp(GameView);
  app.provide(appInjectKey, pixiApp);
  app.provide(GAME_INJECTION_KEY, game);
  app.provide(ASSETS_INJECTION_KEY, assets);
  app.provide(USER_SETTINGS_INJECTION_KEY, settings);
  const { appContext } = getCurrentInstance()!;

  const parent = appContext?.app;
  app.config.globalProperties = parent.config.globalProperties;
  Object.assign(app._context.provides, parent._context.provides);

  gameSession.onReady(async () => {
    await until(assets.fullyLoaded).toBe(true);
    // we only load the spritesheets we need for the cards because there are way too many of them !
    await Promise.all(
      [
        ...new Set(
          gameSession.playerSystem
            .getList()
            .map(player => player.cards)
            .flat()
            .map(card => [
              card.blueprint.spriteId,
              ...(card.blueprint.relatedBlueprintIds?.map(id => CARDS[id].spriteId) ?? [])
            ])
            .flat()
        )
      ].map(async spriteId => {
        return game.assets.loadSpritesheet(spriteId);
        // return game.assets.loadNormalSpritesheet(spriteId, sheet);
      })
    );

    await until(settings.settings).toBeTruthy();

    await soundSequence;
    ready.value = true;
    emit('ready');
    app.mount(pixiApp.stage);
    bgm.next(battleBgms[musicIndex]);
  });
});
</script>

<template>
  <div class="pixi-app-container" @contextmenu.prevent>
    <canvas ref="canvas" :class="ready && 'is-ready'" />
    <GameUi v-if="ready" />
    <Teleport to="body">
      <Transition>
        <GameLoadingScreen v-if="!ready" :session="gameSession" />
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped lang="postcss">
.pixi-app-container {
  cursor: v-bind('cursors.default');
  user-select: none;

  position: relative;
  transform-style: preserve-3d;

  overflow: hidden;

  height: 100vh;

  color: var(--gray-0);

  perspective: 1200px;

  image-rendering: pixelated;
}

.v-leave-active {
  transition: opacity 1.5s;
  transition-delay: 500ms;
}

.v-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import { api } from '@game/api';
import {
  defaultConfig,
  ServerSession,
  tutorialMap,
  TutorialSession,
  type SerializedGameState
} from '@game/sdk';
import type { GameFormat } from '@game/sdk/src/game-session';
import type { Nullable } from '@game/shared';

const { data: me } = useConvexAuthedQuery(api.users.me, {});

const { p1Emote, p2Emote } = useEmoteQueue();
const isFinished = ref(false);
const state = computed(() =>
  me.value
    ? ({
        history: [],
        entities: [],
        rng: {
          values: []
        },
        players: [
          {
            id: me.value._id,
            name: me.value.name ?? 'You',
            currentGold: 3,
            deck: [
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'f1_tutorial_general'
              },
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'f1_placeholder'
              },
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'f2_tutorial_big_dude'
              },
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'f1_placeholder'
              },
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'f1_placeholder'
              },
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'f1_placeholder'
              }
            ],
            isPlayer1: true,
            graveyard: []
          },
          {
            id: 'ai',
            name: 'Instructor Avan',
            deck: [
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'tutorial_general'
              },
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'tutorial_cat'
              },
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'tutorial_cat'
              },
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'tutorial_cat'
              },
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'tutorial_cat'
              },
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'tutorial_cat'
              },
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'tutorial_cat'
              }
            ],
            isPlayer1: false,
            graveyard: []
          }
        ]
      } as unknown as SerializedGameState)
    : null
);

const serverSession = shallowRef(null) as Ref<Nullable<ServerSession>>;
const clientSession = shallowRef(null) as Ref<Nullable<TutorialSession>>;

const dispatch = (
  type: Parameters<TutorialSession['dispatch']>[0]['type'],
  payload: any
) => {
  serverSession.value!.dispatch({
    type,
    payload: {
      ...payload,
      playerId: payload?.playerId ?? serverSession.value!.playerSystem.activePlayer.id
    }
  });
};

const { currentStep, currentTextIndex, steps } = useTutorial([
  {
    meta: {},
    action: {
      type: 'endTurn',
      payload: {
        playerId: me.value._id
      }
    },
    tooltips: [
      { text: 'TODO Tutorial, lol. Lmao, even.' },
      {
        text: 'End your turn to finish the tutorial.'
      }
    ]
  }
]);

const isReady = ref(false);
const format: GameFormat = {
  config: defaultConfig,
  cards: {},
  map: tutorialMap
};
until(state)
  .toBeTruthy()
  .then(state => {
    serverSession.value = ServerSession.create(state, { seed: 'tutorial', format });
    clientSession.value = TutorialSession.createTutorialSession(
      serverSession.value.serialize(),
      steps
    );
    serverSession.value.onUpdate((action, opts) => {
      clientSession.value!.dispatch(action, opts);
    });
    isReady.value = true;
  });
</script>

<template>
  <GameRoot
    v-if="clientSession && me"
    :p1-emote="p1Emote"
    :p2-emote="p2Emote"
    :game-session="clientSession"
    :player-id="me._id"
    :game-type="GAME_TYPES.PVP"
    :current-tutorial-step="currentStep"
    @move="dispatch('move', $event)"
    @attack="dispatch('attack', $event)"
    @end-turn="dispatch('endTurn', $event)"
    @use-skill="dispatch('useSkill', $event)"
    @play-card="dispatch('playCard', $event)"
    @replace="dispatch('replaceCard', $event)"
    @draw="dispatch('draw', $event)"
    @get-gold="dispatch('getGold', $event)"
    @add-rune="dispatch('addRune', $event)"
    @surrender="$router.push({ name: 'ClientHome' })"
  />

  <template v-if="isReady && !isFinished">
    <div class="fancy-surface fixed bottom-11 left-5">
      Camera controls :
      <p>- Click and drag to move</p>
      <p>- mouse wheel to zoom</p>
      <p>- Q / E to rotate</p>
    </div>

    <div v-if="clientSession && currentStep" class="fancy-surface tooltip">
      {{ currentStep.tooltips[currentTextIndex].text }}

      <UiButton
        v-if="
          currentTextIndex < currentStep.tooltips.length - 1 ||
          currentStep.tooltips[currentTextIndex].onLeave
        "
        class="primary-button mt-4"
        @click="
          async () => {
            await currentStep!.tooltips[currentTextIndex].onLeave?.();
            if (currentTextIndex < currentStep!.tooltips.length - 1) {
              currentTextIndex++;
            }
          }
        "
      >
        Next
      </UiButton>
    </div>
  </template>
</template>

<style scoped lang="postcss">
.tooltip {
  position: absolute;
  top: var(--size-4);
  left: 50%;
  transform: translateX(-50%);

  width: 55ch;
}
</style>

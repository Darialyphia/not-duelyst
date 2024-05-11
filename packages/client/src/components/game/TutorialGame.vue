<script setup lang="ts">
import { api } from '@game/api';
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import {
  GameSession,
  TutorialSession,
  type SerializedGameState,
  type TutorialStep
} from '@game/sdk';
import { tutorialMap } from '~/utils/fixtures';

const { data: me } = useConvexAuthedQuery(api.users.me, {});

const state = computed(() =>
  me.value
    ? ({
        history: [],
        entities: [],
        map: tutorialMap,
        players: [
          {
            id: me.value._id,
            name: me.value.name,
            currentGold: 3,
            cards: [
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'f1_general'
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
            cards: [
              {
                pedestalId: 'pedestal-default',
                blueprintId: 'tutorial_general'
              }
            ],
            isPlayer1: false,
            graveyard: []
          }
        ]
      } as SerializedGameState)
    : null
);

const fx = useFXProvider();
const session = ref(null) as Ref<null | TutorialSession>;

const dispatch = (
  type: Parameters<TutorialSession['dispatch']>[0]['type'],
  payload: any
) => {
  session.value!.dispatch({
    type,
    payload: {
      ...payload,
      playerId: payload?.playerId ?? session.value!.playerSystem.activePlayer.id
    }
  });
};

const currentTextIndex = ref(0);
const currentStep = ref<TutorialStep>();
until(state)
  .toBeTruthy()
  .then(state => {
    session.value = TutorialSession.create(state, 'tutorial', fx.ctx, [
      {
        meta: {},
        action: {
          type: 'move',
          payload: {
            position: {
              x: 3,
              y: 3,
              z: 0
            },
            playerId: me.value._id,
            entityId: 1
          }
        },
        tooltips: [
          { text: 'Welcome to your first game of Not Duelyst!' },
          {
            text: "This tutorial will assume you're already familiar with Duelyst. Because I'm lazy."
          },
          { text: 'Click a unit to select it.' },
          { text: 'Click on the highlighted tile to move your general.' }
        ],
        onEnter(session) {
          currentStep.value = session.currentStep;
          this.meta.cleanup = session.fxSystem.addSpriteOnCellUntil(
            session.boardSystem.getCellAt('3:3:0')!,
            'cell_highlight'
          );
        },
        onLeave() {
          this.meta.cleanup();
          currentTextIndex.value = 0;
        }
      },
      {
        meta: {},
        action: {
          type: 'playCard',
          payload: {
            cardIndex: 0,
            targets: [],
            playerId: me.value._id,
            position: { x: 3, y: 4, z: 0 }
          }
        },
        tooltips: [
          {
            text: 'Click a unit in your hand, then click the highlighted tile to summon it.'
          }
        ],
        onEnter(session) {
          currentStep.value = session.currentStep;
          this.meta.cleanup = session.fxSystem.addSpriteOnCellUntil(
            session.boardSystem.getCellAt('3:4:0')!,
            'cell_highlight'
          );
        },
        onLeave() {
          this.meta.cleanup();
          currentTextIndex.value = 0;
        }
      },
      {
        meta: {},
        action: {
          type: 'endTurn',
          payload: {
            playerId: me.value._id
          }
        },
        tooltips: [
          {
            text: "In this game, you don't draw cards. Instead, a unit goes on cooldown after it's played for a few turns."
          },
          { text: 'Press the end turn button to end your turn.' }
        ],
        onEnter(session) {
          currentStep.value = session.currentStep;
        },
        onLeave() {
          currentTextIndex.value = 0;
        }
      },
      {
        meta: {},
        action: {
          type: 'move',
          payload: {
            position: { x: 4, y: 3, z: 0 },
            entityId: 2,
            playerId: 'ai'
          }
        },
        tooltips: [
          {
            text: "My turn to play. I'm going to come forward and attack you. Brace yourself !",
            onLeave() {
              dispatch('move', {
                position: { x: 4, y: 3, z: 0 },
                entityId: 2,
                playerId: 'ai'
              });
            }
          }
        ],
        onEnter(session) {
          currentStep.value = session.currentStep;
        },
        onLeave() {
          currentTextIndex.value = 0;
        }
      },
      {
        meta: {},
        action: {
          type: 'attack',
          payload: {
            targetId: 1,
            entityId: 2,
            playerId: 'ai'
          }
        },
        tooltips: [
          {
            text: 'Here I come !',
            onLeave() {
              dispatch('attack', {
                targetId: 1,
                entityId: 2,
                playerId: 'ai'
              });
            }
          }
        ],
        onEnter(session) {
          currentStep.value = session.currentStep;
        },
        onLeave() {
          currentTextIndex.value = 0;
        }
      }
    ]);
  });
</script>

<template>
  <GameRoot
    v-if="session && me"
    :p1-emote="null"
    :p2-emote="null"
    :game-session="session"
    :player-id="me._id"
    :game-type="GAME_TYPES.PVP"
    @move="dispatch('move', $event)"
    @attack="dispatch('attack', $event)"
    @end-turn="dispatch('endTurn', $event)"
    @use-skill="dispatch('useSkill', $event)"
    @play-card="dispatch('playCard', $event)"
  />

  <div class="fancy-surface fixed bottom-5 left-8">
    Camera controls :
    <p>- Click and drag to move</p>
    <p>- mouse wheel to zoom</p>
    <p>- Q / E to rotate</p>
  </div>

  <div class="fancy-surface tooltip" v-if="session && currentStep">
    {{ currentStep.tooltips[currentTextIndex].text }}

    <UiButton
      class="primary-button mt-4"
      v-if="
        currentTextIndex < currentStep.tooltips.length - 1 ||
        currentStep.tooltips[currentTextIndex].onLeave
      "
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

<style scoped lang="postcss">
.tooltip {
  position: absolute;
  top: var(--size-4);
  left: 50%;
  transform: translateX(-50%);

  width: 55ch;
}
</style>

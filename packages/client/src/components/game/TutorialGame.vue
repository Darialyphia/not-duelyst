<script setup lang="ts">
import { api } from '@game/api';
import {
  config,
  FACTION_IDS,
  ServerSession,
  TutorialSession,
  type SerializedGameState
} from '@game/sdk';
import type { Nullable } from '@game/shared';
import { tutorialMap } from '~/utils/fixtures';

const { data: me } = useConvexAuthedQuery(api.users.me, {});

const { addP1, p1Emote, p2Emote } = useEmoteQueue();
const isFinished = ref(false);
const state = computed(() =>
  me.value
    ? ({
        history: [],
        entities: [],
        map: tutorialMap,
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
      } as SerializedGameState)
    : null
);

const fx = useFXProvider();
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
        text: "This tutorial assumes you have previous Duelyst knowledge. If that isn't the case, sorry."
      },
      { text: 'A fresh new player tutorial is in the works, stay tuned !' },
      {
        text: "Even if you're already a seasoned Duelyst player, there are some major difference between the two games."
      },
      { text: "The tutorial will bring you up to speed. Alright let's start." },
      {
        text: 'Click on your general to select it, then click on the highlighted tile to move there.'
      }
    ],
    onEnter(session) {
      this.meta.cleanup = session.fxSystem.addSpriteOnCellUntil(
        session.boardSystem.getCellAt('3:3:0')!,
        'cell_highlight'
      );
    },
    onLeave() {
      this.meta.cleanup();
    }
  },
  {
    meta: {},
    action: {
      type: 'addRune',
      payload: {
        factionId: FACTION_IDS.F1,
        playerId: me.value._id
      }
    },
    highlightedResourceAction: 'f1',
    tooltips: [
      { text: 'Playing cards in this game requires 2 resources: gold and runes.' },
      {
        text: `You gain 3 gold per turn, up to a maximum of ${config.MAX_GOLD}. The remaining gold at the end of your turn carries over to the following turn.`
      },
      {
        text: 'As for runes there is oen for each faction. You can gain one rune of your choosing per turn.'
      },
      {
        text: 'Runes are not spent when playing a card. Once you reach a card runes requirement, you can play it whenever as long as you have enough gold.'
      },
      {
        text: 'The cards in your hand require one green rune, so add one on the bottom right of the screen.'
      }
    ]
  },
  {
    meta: {},
    action: {
      type: 'playCard',
      payload: {
        cardIndex: 0,
        targets: [],
        playerId: me.value._id,
        position: { x: 3, y: 4, z: 0 },
        blueprintFollowup: []
      }
    },
    highlightedCardIndex: 0,
    tooltips: [
      {
        text: "Your and your opponent's total runes are displayed below your portrait at the top of the screen."
      },
      {
        text: "You now have enough runes to play a card. Let's play the first card in your hand."
      }
    ],
    onEnter(session) {
      this.meta.cleanup = session.fxSystem.addSpriteOnCellUntil(
        session.boardSystem.getCellAt('3:4:0')!,
        'cell_highlight'
      );
    },
    onLeave() {
      this.meta.cleanup();
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
      { text: "Like Duelyst, units can't act the turn they are summoned." },
      { text: 'Press the end turn button to end your turn.' }
    ]
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
    ]
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
    ]
  },
  {
    meta: {},
    action: {
      type: 'endTurn',
      payload: { playerId: 'ai' }
    },
    tooltips: [
      {
        text: "Hope that didn't hurt too much ! Your turn now !",
        onLeave() {
          dispatch('endTurn', { playerId: 'ai' });
        }
      }
    ]
  },
  {
    meta: {},
    action: {
      type: 'attack',
      payload: {
        targetId: 2,
        entityId: 3,
        playerId: me.value._id
      }
    },
    tooltips: [
      {
        text: 'Select your elemental and click the enemy general to perform an attack.'
      }
    ],
    onEnter(session) {
      this.meta.cleanup = session.fxSystem.addSpriteOnCellUntil(
        session.boardSystem.getCellAt('3:4:0')!,
        'cell_highlight'
      );
    },
    onLeave() {
      this.meta.cleanup();
    }
  },
  {
    meta: {},
    action: {
      type: 'attack',
      payload: {
        targetId: 2,
        entityId: 1,
        playerId: me.value._id
      }
    },
    tooltips: [
      {
        text: 'In this game, units only counterattack once per turn, unless specified otherwise.'
      },
      { text: "Try to attack with your general, it won't take damage !" }
    ],
    onEnter(session) {
      this.meta.cleanup = session.fxSystem.addSpriteOnCellUntil(
        session.boardSystem.getCellAt('3:3:0')!,
        'cell_highlight'
      );
    },
    onLeave() {
      this.meta.cleanup();
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
    tooltips: [{ text: 'Press the end turn button to end your turn.' }]
  },
  {
    meta: {},
    action: {
      type: 'playCard',
      payload: {
        cardIndex: 0,
        targets: [],
        playerId: 'ai',
        position: { x: 4, y: 4, z: 0 },
        blueprintFollowup: []
      }
    },
    tooltips: [
      {
        text: 'By the way, have you met my cat ?',
        onLeave() {
          dispatch('playCard', {
            cardIndex: 0,
            targets: [],
            playerId: 'ai',
            position: { x: 4, y: 4, z: 0 },
            blueprintFollowup: []
          });
          addP1('poggers');
        }
      }
    ]
  },
  {
    meta: {},
    action: {
      type: 'endTurn',
      payload: {
        playerId: 'ai'
      }
    },
    tooltips: [
      {
        text: 'Adorable right ? Sure would be a shame if something were to happen to it :monkaS:'
      },
      {
        text: 'Alright, your turn now !',
        onLeave() {
          dispatch('endTurn', {});
        }
      }
    ]
  },
  {
    meta: {},
    action: {
      type: 'useSkill',
      payload: {
        playerId: me.value._id,
        entityId: 1,
        skillIndex: 0,
        targets: [
          {
            x: 3,
            y: 4,
            z: 0
          }
        ],
        blueprintFollowup: []
      }
    },
    tooltips: [
      {
        text: 'The cat has 3HP. Your units only have 2 attack. If only you could kill it in one blow...'
      },
      { text: "The cards in your hand won't help us. But there is another way !" },
      { text: 'A lot of units, your general included, have activated abilities.' },
      { text: 'They can be activated at not cost, but have a cooldown.' },
      {
        text: 'To use an ability, select a unit. Its abilities will appear on the bottom right next to the runes buttons.'
      },
      {
        text: "Select your general and use its abilities to increase your elemental's attack"
      }
    ]
  },
  {
    meta: {},
    action: {
      type: 'attack',
      payload: {
        playerId: me.value._id,
        entityId: 3,
        targetId: 4
      }
    },
    tooltips: [
      {
        text: 'There you go. Most units can use their ability the turn they are summoned. However some have an initial cooldown.'
      },
      {
        text: 'Some of them can even have runes requirement.'
      },

      {
        text: 'You can right click any unit on the field or in your hand to see its full details'
      },
      {
        text: "Now you're ready to whac...pet the cat with your elemental."
      }
    ],
    onEnter(session) {
      this.meta.cleanup = session.fxSystem.addSpriteOnCellUntil(
        session.boardSystem.getCellAt('3:4:0')!,
        'cell_highlight'
      );
    },
    onLeave() {
      this.meta.cleanup();
    }
  },
  {
    meta: {},
    action: {
      type: 'move',
      payload: {
        playerId: me.value._id,
        entityId: 3,
        position: { x: 5, y: 3, z: 0 }
      }
    },
    tooltips: [
      {
        text: 'Units can move after they have attacked or used an ability.'
      },
      {
        text: 'Unlike Duelyst, your units body block themselves. Be careful with your positioning !.'
      },
      { text: 'move your elemental to the highlighted cell.' }
    ],
    onEnter(session) {
      this.meta.cleanup = session.fxSystem.addSpriteOnCellUntil(
        session.boardSystem.getCellAt('5:3:0')!,
        'cell_highlight'
      );
    },
    onLeave() {
      this.meta.cleanup();
    }
  },
  {
    meta: {},
    action: {
      type: 'surrender',
      payload: {
        playerId: 'ai'
      }
    },
    tooltips: [
      {
        text: 'That about covers it for he differences between Duelyst and Not Duelyst.'
      },
      {
        text: "There are (or will be, it's still pretty early in development) a lot of stuff added, like different maps with elevations, different special tiles, etc"
      },
      {
        text: "I hope you'll have fun playing the game !",
        onLeave() {
          dispatch('surrender', { playerId: 'ai' });
        }
      }
    ]
  }
]);

const isReady = ref(false);
until(state)
  .toBeTruthy()
  .then(state => {
    serverSession.value = ServerSession.create(state, 'tutorial');
    clientSession.value = TutorialSession.createTutorialSession(
      serverSession.value.serialize(),
      fx.ctx,
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

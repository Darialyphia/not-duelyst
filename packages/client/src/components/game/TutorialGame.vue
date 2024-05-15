<script setup lang="ts">
import { api } from '@game/api';
import { config, TutorialSession, type SerializedGameState } from '@game/sdk';
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
        players: [
          {
            id: me.value._id,
            name: me.value.name ?? 'You',
            currentGold: 3,
            cards: [
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
        text: "This tutorial will assume you're already familiar with Duelyst. Because I'm lazy."
      },
      { text: 'Click a unit to select it.' },
      { text: 'Click on the highlighted tile to move your general.' }
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
      type: 'playCard',
      payload: {
        cardIndex: 0,
        targets: [],
        playerId: me.value._id,
        position: { x: 3, y: 4, z: 0 },
        blueprintFollowup: []
      }
    },
    tooltips: [
      {
        text: 'Click a unit in your hand, then click the highlighted tile to summon it.'
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
      {
        text: "In this game, you don't draw cards. Instead, a unit goes on cooldown after it's played for a few turns."
      },
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
        text: 'Adorable right ? Sure would be a shame if something were to happen to it :monkaS:',
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
      { text: "And that's what we're gonna do, by increasing your Elemental's attack." },
      { text: "We'll do that using your general ability." },
      {
        text: 'All units in the game have abilities that they can use instead of attacking.'
      },
      { text: "Use your general ability to boost your elemental's attack." }
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
        text: "Now you're ready to whac...pet the cat with your elemental."
      },
      { text: 'Go ahead, it keeps ignoring its litterbox anyways.' }
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
        position: { x: 4, y: 4, z: 0 }
      }
    },
    tooltips: [
      {
        text: `At the start of your turn, you get ${config.GOLD_PER_TURN} gold to summon new units.`
      },
      { text: `The maximum amount of gold you can hold is ${config.MAX_GOLD}.` },
      {
        text: "Unlike Duelyst, your remaining gold doesn't go away at the end of your turn. However, the amount of gold you gain doesn't icnrease over time."
      },
      {
        text: 'Defeated units leave a gold coin on the ground.'
      },
      {
        text: 'Grabbing the gold coin will give you enough gold to summon your other unit.'
      },
      {
        text: 'Move on the gold coin with your elemental. As you can see, a unit can move after attacking.'
      }
    ],
    onEnter(session) {
      this.meta.cleanup = session.fxSystem.addSpriteOnCellUntil(
        session.boardSystem.getCellAt('4:4:0')!,
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
      type: 'playCard',
      payload: {
        cardIndex: 1,
        targets: [],
        playerId: me.value._id,
        position: { x: 3, y: 2, z: 0 },
        blueprintFollowup: []
      }
    },
    tooltips: [
      {
        text: 'Now, summon the unit in your hand that is not on cooldown on the highlighted tile.'
      }
    ],
    onEnter(session) {
      this.meta.cleanup = session.fxSystem.addSpriteOnCellUntil(
        session.boardSystem.getCellAt('3:2:0')!,
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
      payload: { playerId: me.value._id }
    },
    tooltips: [
      {
        text: 'Your general took damage ! What happened ?'
      },
      { text: "That's because you played a card from a different faction." },
      {
        text: 'In Not duelyst, you can add any unit from any faction to your deck, but playing units from a faction different from your general costs HP.'
      },
      {
        text: "The HP cost is equal to the number or faction runes the unit has that your general doesn't."
      },
      {
        text: "A unit's runes is displayed in the top-left of the card. Your general runes appear on the top of the screen, below your portrait."
      },
      {
        text: "Alright, that's about it. End your turn, then try to defeat the enemy general ! (It won't move for now because coding an AI takes time)"
      }
    ],
    onLeave() {
      isFinished.value = true;
      setTimeout(() => {
        dispatch('endTurn', { playerId: 'ai' });
      }, 1500);

      session.value?.on('player:turn_start', player => {
        if (player.id === 'ai') {
          setTimeout(() => {
            dispatch('endTurn', { playerId: 'ai' });
          }, 1500);
        }
      });
    }
  }
]);

const isReady = ref(false);
until(state)
  .toBeTruthy()
  .then(state => {
    session.value = TutorialSession.create(state, 'tutorial', fx.ctx, steps);
    session.value.once('game:ready', () => {
      isReady.value = true;
    });
  });
</script>

<template>
  <GameRoot
    v-if="session && me"
    :p1-emote="p1Emote"
    :p2-emote="p2Emote"
    :game-session="session"
    :player-id="me._id"
    :game-type="GAME_TYPES.PVP"
    @move="dispatch('move', $event)"
    @attack="dispatch('attack', $event)"
    @end-turn="dispatch('endTurn', $event)"
    @use-skill="dispatch('useSkill', $event)"
    @play-card="dispatch('playCard', $event)"
    @surrender="$router.push({ name: 'ClientHome' })"
  />

  <template v-if="isReady && !isFinished">
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

<script setup lang="ts">
import { match } from 'ts-pattern';

const players = useGameSelector(session => session.playerSystem.getList());

const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);

const { playerId, gameType, dispatch, p1Emote, p2Emote } = useGame();

const isEmotePopoverOpened = ref(false);
const emotePopoverPlayer = ref<0 | 1>(0);

// @TODO get emotes from user collection when it's implemented
// in the meantime let's just hardcode it
const EMOTES = ['poggers', 'ahegao', 'sus'];
</script>

<template>
  <PopoverRoot v-model:open="isEmotePopoverOpened">
    <PopoverPortal>
      <Transition name="emote-popover">
        <PopoverContent :side-offset="30" as-child :collision-padding="20">
          <div class="emote-popover">
            <PopoverArrow class="popover-arrow" :height="10" :width="15" />

            <button
              v-for="emote in EMOTES"
              :key="emote"
              :style="{ '--bg': `url('/assets/emotes/${emote}.png')` }"
              @click="
                () => {
                  if (emotePopoverPlayer === 0) {
                    dispatch('p1Emote', emote);
                  } else {
                    dispatch('p2Emote', emote);
                  }
                  isEmotePopoverOpened = false;
                }
              "
            />
          </div>
        </PopoverContent>
      </Transition>
    </PopoverPortal>

    <div class="player player-1" :class="activePlayer.equals(players[0]) && 'active'">
      <div>
        <div
          class="img-wrapper"
          @contextmenu.prevent="
            () => {
              match(gameType)
                .with(GAME_TYPES.SPECTATOR, () => null)
                .with(GAME_TYPES.SANDBOX, () => {
                  if (activePlayer.equals(players[0])) {
                    isEmotePopoverOpened = true;
                    emotePopoverPlayer = 0;
                  }
                })
                .with(GAME_TYPES.PVP, () => {
                  if (playerId === players[0].id) {
                    isEmotePopoverOpened = true;
                    emotePopoverPlayer = 0;
                  }
                })
                .exhaustive();
            }
          "
        >
          <CardSprite
            :sprite-id="players[0].general.card.blueprint.spriteId"
            class="portrait"
          />

          <PopoverAnchor v-if="emotePopoverPlayer === 0" />
        </div>

        <div class="flex gap-7 pt-10">
          <div
            v-for="artifact in players[0].artifacts"
            :key="artifact.id"
            class="artifact"
          >
            <CardSprite
              :sprite-id="artifact.card.blueprint.spriteId"
              animation="default"
            />
            <div class="flex gap-1 justicy-center">
              <div v-for="i in artifact.durability" :key="i" class="durability" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="player-name">{{ players[0].name }}</div>

        <div class="indicators">
          <div class="hp">
            <Transition mode="out-in">
              <span :key="players[0].general?.hp.toFixed()">
                {{ players[0].general?.hp.toFixed() }}
              </span>
            </Transition>
          </div>
          <div class="gold">
            <Transition mode="out-in">
              <span :key="players[0].currentGold">
                {{ players[0].currentGold }}
              </span>
            </Transition>
          </div>
          <div class="cards">
            <Transition mode="out-in">
              <span :key="players[0].hand.length">
                {{ players[0].hand.length }}
              </span>
            </Transition>
          </div>
        </div>
      </div>

      <Transition mode="out-in">
        <img v-if="p1Emote" :key="p1Emote" :src="`/assets/emotes/${p1Emote}.png`" />
      </Transition>
    </div>

    <div class="player player-2" :class="activePlayer.equals(players[1]) && 'active'">
      <div>
        <div
          class="img-wrapper"
          @contextmenu.prevent="
            () => {
              match(gameType)
                .with(GAME_TYPES.SPECTATOR, () => null)
                .with(GAME_TYPES.SANDBOX, () => {
                  if (activePlayer.equals(players[1])) {
                    isEmotePopoverOpened = true;
                    emotePopoverPlayer = 1;
                  }
                })
                .with(GAME_TYPES.PVP, () => {
                  if (playerId === players[1].id) {
                    isEmotePopoverOpened = true;
                    emotePopoverPlayer = 1;
                  }
                })
                .exhaustive();
            }
          "
        >
          <CardSprite
            :sprite-id="players[1].general.card.blueprint.spriteId"
            class="portrait"
          />

          <PopoverAnchor v-if="emotePopoverPlayer === 1" />
        </div>

        <div class="flex flex-row-reverse gap-7 pt-10">
          <div
            v-for="artifact in players[1].artifacts"
            :key="artifact.id"
            class="artifact"
          >
            <CardSprite
              :sprite-id="artifact.card.blueprint.spriteId"
              animation="default"
            />
            <div class="flex gap-1 justicy-center">
              <div v-for="i in artifact.durability" :key="i" class="durability" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="player-name">{{ players[1].name }}</div>

        <div class="indicators">
          <div class="hp">
            <Transition mode="out-in">
              <span :key="players[1].general?.hp.toFixed()">
                {{ players[1].general?.hp.toFixed() }}
              </span>
            </Transition>
          </div>
          <div class="gold">
            <Transition mode="out-in">
              <span :key="players[1].currentGold">
                {{ players[1].currentGold }}
              </span>
            </Transition>
          </div>
          <div class="cards">
            <Transition mode="out-in">
              <span :key="players[1].hand.length">
                {{ players[1].hand.length }}
              </span>
            </Transition>
          </div>
        </div>
      </div>

      <Transition mode="out-in">
        <img v-if="p2Emote" :key="p2Emote" :src="`/assets/emotes/${p2Emote}.png`" />
      </Transition>
    </div>
  </PopoverRoot>
</template>

<style scoped lang="postcss">
.player {
  isolation: isolate;
  position: absolute;
  top: var(--size-7);

  display: flex;
  flex-wrap: wrap;
  gap: var(--size-3);

  text-shadow: black 1px 0 5px;

  &:not(.active) .portrait {
    filter: grayscale(100%);
  }

  [class^='i-'] {
    font-size: var(--font-size-4);

    &.hp {
      color: var(--green-4);
    }
    &.gold {
      color: var(--yellow-5);
    }
    .cards {
      color: var(--purple-8);
    }
  }

  > img {
    transform-origin: center center;

    aspect-ratio: 1;
    width: 128px;

    image-rendering: pixelated;

    animation: emote 0.3s ease-out;
  }
}

.img-wrapper {
  --size: 140px;
  --corner-clip: 15px;

  position: relative;

  overflow: hidden;
  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: var(--size);
  padding: 4px;

  background-image: radial-gradient(circle at center, black, black 65%, transparent 65%);
  clip-path: polygon(
    var(--corner-clip) 0%,
    calc(var(--size) - var(--corner-clip)) 0%,
    100% var(--corner-clip),
    100% calc(var(--size) - var(--corner-clip)),
    calc(var(--size) - var(--corner-clip)) 100%,
    var(--corner-clip) 100%,
    0% calc(var(--size) - var(--corner-clip)),
    0% var(--corner-clip)
  );

  @screen lt-lg {
    align-self: flex-start;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/assets/ui/hero-portrait-border.png');
  }
}

.portrait {
  transform: scale(3) translateY(-5px);
  width: 100px;
  height: 100px;
  background-position: 0 8px;
  /* 
  mask-image: radial-gradient(
    circle at center,
    black,
    black 24px,
    transparent 24px
  ) !important; */
}

.player-1 {
  left: var(--size-5);

  @screen lt-lg {
    top: var(--size-1);
    left: var(--size-1);
    transform-origin: top left;
    scale: 0.7;

    flex-direction: column;
  }
}
.player-2 {
  right: var(--size-5);
  flex-direction: row-reverse;
  text-align: right;

  @screen lt-lg {
    top: var(--size-1);
    right: var(--size-1);
    transform-origin: top right;
    scale: 0.7;

    flex-direction: column;
  }

  .portrait {
    transform: scale(3) translateY(-5px) rotateY(0.5turn);
  }
}

.player-name {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);

  @screen lt-lg {
    display: none;
  }
}

.indicators {
  display: flex;
  gap: var(--size-2);
  font-size: var(--font-size-4);

  @screen lt-lg {
    gap: var(--size-1);
    font-size: var(--font-size-4);
  }

  @screen lt-lg {
    display: flex;
  }

  .player-2 & {
    justify-items: end;
  }
}
.hp {
  background-image: url('/assets/ui/hero-portrait-hp.png');
  :is(.v-enter-active, .v-leave-active) {
    transition:
      opacity 0.4s,
      transform 0.4s,
      color 0.2s;
  }
  :is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
  :is(.v-leave-to) {
    transform: scale(2) translateY(var(--size-2));
    color: red;
  }
  :is(.v-enter-from) {
    transform: translateY(calc(-1 * var(--size-2)));
  }
}

.gold {
  background-image: url('/assets/ui/hero-portrait-gold.png');
  :is(.v-enter-active, .v-leave-active) {
    transition:
      opacity 0.4s,
      transform 0.4s;
  }
  :is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
  :is(.v-leave-to) {
    transform: scale(2) translateY(var(--size-2));
  }
  :is(.v-enter-from) {
    transform: translateY(calc(-1 * var(--size-2)));
  }
}

.cards {
  background-image: url('/assets/ui/hero-portrait-cards.png');
  :is(.v-enter-active, .v-leave-active) {
    transition:
      opacity 0.4s,
      transform 0.4s;
  }
  :is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
  :is(.v-leave-to) {
    transform: scale(2) translateY(var(--size-2));
  }
  :is(.v-enter-from) {
    transform: translateY(calc(-1 * var(--size-2)));
  }
}

:is(.gold, .hp, .cards) {
  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: 64px;

  background-size: cover;
}

.emote-popover {
  transform-origin: top left;

  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--size-5);

  max-height: var(--size-13);
  padding: var(--size-4);

  color: black;

  background-color: white;
  border-radius: var(--radius-3);
  box-shadow: 0 3px 0.5rem hsl(-gray-0-hsl / 0.6);

  > button {
    aspect-ratio: 1;
    width: 128px;

    background-image: var(--bg);
    background-size: cover;

    image-rendering: pixelated;
    &:hover {
      background-color: var(--gray-2);
      border-radius: var(--radius-2);
    }
  }
  > span {
    fill: white;
  }
}

.emote-popover-enter-active,
.emote-popover-leave-active {
  transition:
    opacity 0.2s ease-out,
    scale 0.2s ease-out;
}

.emote-popover-enter-from,
.emote-popover-leave-to {
  scale: 0;
  opacity: 0;
}

img.v-enter-active,
img.v-leave-active {
  transition: all 0.3s ease-in;
}

img.v-enter-from,
img.v-leave-to {
  transform: scale(0);
  opacity: 0;
}

.artifact {
  transform: scale(1.5);
  width: var(--size-6);
}

.durability {
  width: var(--size-1);
  height: var(--size-2);
  background: linear-gradient(130deg, var(--gray-0), var(--gray-4));
  outline: solid 1px hsl(0 0 0 / 0.5);
}
</style>

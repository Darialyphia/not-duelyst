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
        <PopoverContent
          class="emote-popover"
          :side-offset="30"
          as-child
          :collision-padding="20"
        >
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

        <div class="runes">
          <div
            v-for="(_, i) in 3"
            :key="i"
            :style="{
              '--bg': `url('/assets/ui/rune-${
                players[0].general.card.blueprint.factions[i]?.id.toLowerCase() ?? 'empty'
              }.png')`
            }"
          />
        </div>

        <PopoverAnchor v-if="emotePopoverPlayer === 0" />
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
        </div>
      </div>

      <Transition mode="out-in">
        <img v-if="p1Emote" :key="p1Emote" :src="`/assets/emotes/${p1Emote}.png`" />
      </Transition>
    </div>

    <div class="player player-2" :class="activePlayer.equals(players[1]) && 'active'">
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
        <div class="runes">
          <div
            v-for="(_, i) in 3"
            :key="i"
            :style="{
              '--bg': `url('/assets/ui/rune-${
                players[1].general.card.blueprint.factions[i]?.id.toLowerCase() ?? 'empty'
              }.png')`
            }"
          />
        </div>

        <PopoverAnchor v-if="emotePopoverPlayer === 1" />
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
  top: var(--size-2);

  display: flex;
  gap: var(--size-3);
  align-items: flex-end;

  text-shadow: black 1px 0 5px;

  &:not(.active) .img-wrapper {
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
  position: relative;

  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: 140px;
  padding: 4px;

  background-image: url('/assets/ui/hero-portrait-border.png'),
    radial-gradient(circle at center, black, black 65%, transparent 65%);

  @screen lt-lg {
    align-self: flex-start;
  }
}

.portrait {
  transform: scale(3);
  background-position: 0 8px;

  mask-image: radial-gradient(
    circle at center,
    black,
    black 20px,
    transparent 20px
  ) !important;
}

.player-1 {
  left: var(--size-5);

  @screen lt-sm {
    top: 0;
    left: 0;
  }
}
.player-2 {
  right: var(--size-5);
  flex-direction: row-reverse;
  text-align: right;

  @screen lt-sm {
    top: 0;
    right: 0;
  }

  .portrait {
    transform: scale(3) rotateY(0.5turn);
  }
}

.player-name {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-6);

  @screen lt-lg {
    font-size: var(--font-size-2);
  }
}

.indicators {
  display: grid;
  gap: var(--size-2);
  font-size: var(--font-size-4);

  @screen lt-lg {
    gap: var(--size-1);
    font-size: var(--font-size-0);
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

:is(.gold, .hp) {
  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: 64px;

  background-size: cover;
}
.runes {
  position: absolute;
  z-index: 1;
  bottom: calc(-1 * var(--size-2));
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: 6px;
  justify-content: center;

  width: fit-content;
  padding: 6px 3px;

  background-image: url('/assets/ui/runes-bg.png');
  background-size: contain;
  > div {
    transform: translateY(-2px);

    width: 20px;
    height: 24px;

    background-image: var(--bg);
    background-size: contain;

    &:nth-of-type(2) {
      transform: translateY(2px);
    }
  }
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
</style>

<script setup lang="ts">
import { match } from 'ts-pattern';

const { playerId } = defineProps<{ playerId: string }>();
const player = useGameSelector(session => session.playerSystem.getPlayerById(playerId)!);

const { dispatch, gameType } = useGame();

const isEmotePopoverOpened = ref(false);

const playerIndex = useGameSelector(session => {
  const p = session.playerSystem.getPlayerById(playerId)!;

  return session.playerSystem.getList().indexOf(p);
});

// @TODO get emotes from user collection when it's implemented; in the meantime let's just hardcode it
const EMOTES = ['poggers', 'ahegao', 'yussy', 'ezpepe', 'omegalul'];
</script>

<template>
  <PopoverRoot v-model:open="isEmotePopoverOpened">
    <PopoverPortal>
      <Transition name="emote-popover" :duration="{ enter: 200, leave: 200 }">
        <PopoverContent :side-offset="30" as-child :collision-padding="20">
          <div class="emote-popover" :class="{ flipped: playerIndex === 1 }">
            <PopoverArrow class="popover-arrow" :height="10" :width="15" />

            <button
              v-for="emote in EMOTES"
              :key="emote"
              :style="{ '--bg': `url('/assets/emotes/${emote}.png')` }"
              @click="
                () => {
                  if (playerIndex === 0) {
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
    <Transition appear name="portrait">
      <div
        class="img-wrapper"
        :class="playerIndex === 1 && 'is-p2'"
        @contextmenu.prevent="
          () => {
            match(gameType)
              .with(GAME_TYPES.SPECTATOR, () => null)
              .with(GAME_TYPES.SANDBOX, () => {
                isEmotePopoverOpened = true;
              })
              .with(GAME_TYPES.PVP, () => {
                isEmotePopoverOpened = true;
              })
              .exhaustive();
          }
        "
      >
        <CardSprite
          :sprite-id="player.general.card.blueprint.spriteId"
          class="portrait"
        />
      </div>
    </Transition>
    <PopoverAnchor />
  </PopoverRoot>
</template>

<style scoped lang="postcss">
.img-wrapper {
  --size: 140px;
  --corner-clip: 15px;

  pointer-events: auto;

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

  .is-p2 & {
    transform: scale(3) translateY(-5px) rotateY(0.5turn);
  }
}

.emote-popover {
  transform-origin: top left;
  &.flipped {
    transform-origin: top right;
  }

  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--size-5);

  max-height: 99999px;
  padding: var(--size-4);

  color: black;

  background-color: white;
  border-radius: var(--radius-3);
  box-shadow: 0 3px 0.5rem hsl(var(--gray-11-hsl) / 0.6);

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

:is(.emote-popover-enter-active, .emote-popover-leave-active) .emote-popover {
  transition:
    opacity 0.2s ease-out,
    scale 0.2s ease-out;
}

:is(.emote-popover-enter-from, .emote-popover-leave-to) .emote-popover {
  scale: 0;
  opacity: 0;
}

.portrait-enter-active {
  transition: all 0.5s var(--ease-3);
}
.portrait-enter-from {
  transform: translateX(-100%);
  opacity: 0;
  &.is-p2 {
    transform: translateX(100%);
  }
}
</style>

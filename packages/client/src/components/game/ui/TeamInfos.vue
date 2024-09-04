<script setup lang="ts">
const players = useGameSelector(session => session.playerSystem.getList());
const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
const { p1Emote, p2Emote } = useGame();
</script>

<template>
  <div class="player player-1" :class="activePlayer.equals(players[0]) && 'active'">
    <div>
      <PlayerPortrait :player-id="players[0].id" />
      <div class="flex">
        <PlayerEquipedArtifacts :player-id="players[0].id" />
      </div>
    </div>

    <div>
      <div class="player-name">{{ players[0].name }}</div>

      <div class="indicators">
        <PlayerIndicators :player-id="players[0].id" />
      </div>
    </div>

    <Transition mode="out-in">
      <img
        v-if="p1Emote"
        :key="p1Emote"
        :src="`/assets/emotes/${p1Emote}.png`"
        class="emote"
      />
    </Transition>
  </div>

  <div class="player player-2" :class="activePlayer.equals(players[1]) && 'active'">
    <div>
      <PlayerPortrait :player-id="players[1].id" />
      <div class="flex flex-row-reverse">
        <PlayerEquipedArtifacts :player-id="players[1].id" />
      </div>
    </div>
    <div>
      <div class="player-name">{{ players[1].name }}</div>

      <div class="indicators">
        <PlayerIndicators :player-id="players[1].id" />
      </div>
    </div>

    <Transition mode="out-in">
      <img v-if="p2Emote" :key="p2Emote" :src="`/assets/emotes/${p2Emote}.png`" />
    </Transition>
  </div>
</template>

<style scoped lang="postcss">
.player {
  /* pointer-events: none; */

  isolation: isolate;
  position: absolute;
  top: var(--size-7);

  display: flex;
  flex-wrap: wrap;
  gap: var(--size-3);

  text-shadow: black 1px 0 5px;

  @screen lt-lg {
    top: var(--size-1);
    scale: 0.7;
    align-items: flex-start;
  }

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
    &.cards {
      color: var(--purple-8);
    }
    &.graveyard {
      color: var(--pink-8);
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

.player-1 {
  left: var(--size-5);

  @screen lt-lg {
    left: var(--size-1);
    transform-origin: top left;
  }
}
.player-2 {
  right: var(--size-5);
  flex-direction: row-reverse;
  text-align: right;

  @screen lt-lg {
    right: var(--size-1);
    transform-origin: top right;
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
  transform-style: preserve-3d;

  @screen lt-lg {
    transform-origin: top left;
    scale: 0.75;

    flex-direction: column;
    gap: var(--size-1);
    align-items: flex-start;

    font-size: var(--font-size-4);
  }

  .player-2 & {
    flex-direction: row-reverse;
  }
}

.emote {
  align-self: center;
}
.emote.v-enter-active,
.emote.v-leave-active {
  transition: all 0.3s ease-in;
}

.emote.v-enter-from,
.emote.v-leave-to {
  transform: scale(0);
  opacity: 0;
}
</style>

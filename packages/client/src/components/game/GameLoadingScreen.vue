<script setup lang="ts">
import type { ClientSession, Unit } from '@game/sdk';

const { session } = defineProps<{ session: ClientSession }>();

const players = session.playerSystem.getList();
const p1 = players.find(p => p.isPlayer1);

const generals = [p1!.general.card, p1?.opponent.general.card] as [Unit, Unit];
</script>

<template>
  <div
    class="loading-screen"
    :style="{
      '--left-bg': `url(/assets/backgrounds/crest_${generals[0].blueprint.faction?.id}.png)`,
      '--right-bg': `url(/assets/backgrounds/crest_${generals[1].blueprint.faction?.id}.png)`
    }"
  >
    <div>
      <Transition appear>
        <CardSprite
          class="general p1"
          :sprite-id="generals[0].blueprint.spriteId"
          :pedestal-id="generals[0].pedestalId"
          animation="run"
        />
      </Transition>
      <div class="name">
        {{ p1?.name }}
      </div>
    </div>
    <div class="vs">VS</div>
    <div>
      <Transition appear>
        <CardSprite
          class="general p2"
          :sprite-id="generals[1].blueprint.spriteId"
          :pedestal-id="generals[1].pedestalId"
          animation="run"
        />
      </Transition>

      <div class="name">
        {{ p1?.opponent.name }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.loading-screen {
  position: fixed;
  z-index: 99999;
  inset: 0;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-content: center;
  justify-items: center;
  font-weight: var(--font-weight-7);

  background: var(--left-bg), var(--right-bg), black;
  background-size: contain, contain, cover;
  background-position:
    left 0,
    right 0;
  -webkit-text-fill-color: var(--gray-11);
  -webkit-text-stroke: 2px var(--gray-0);
  background-repeat: no-repeat, no-repeat, no-repeat;
  > .vs {
    font-size: 8rem;
    filter: drop-shadow(6px 6px 0 var(--cyan-5)) drop-shadow(-6px -6px 0 var(--orange-5));
    justify-self: center;
  }
}

.general {
  transform-origin: center;
  aspect-ratio: 1;
  width: 150px;
  translate: 0 -60px;
  border-radius: var(--radius-round);
  background: radial-gradient(circle at center, hsl(0 0 0 / 0.8), transparent 75%);

  &.v-enter-active {
    transition:
      opacity 0.3s var(--ease-2),
      transform 0.3s var(--ease-2),
      filter 1.5s var(--ease-2);
  }
  &.v-enter-from {
    translate: 0 200px;
    opacity: 0;
    filter: brightness(500%) contrast(300%);
  }
}

.p1 {
  transform: scale(3);
  &.v-enter-from {
    translate: 0 -200px;
  }
}

.p2 {
  transform: scaleX(-3) scaleY(3);
  &.v-enter-from {
    translate: 0 200px;
  }
}

.name {
  transform: translateY(var(--size-10));
  font-size: var(--font-size-5);
  -webkit-text-stroke: 1px var(--gray-0);
}
</style>

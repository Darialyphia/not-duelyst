<script setup lang="ts">
import type { ClientSession, Unit } from '@game/sdk';

const { session } = defineProps<{ session: ClientSession }>();

const generals = computed(() => {
  const players = session.playerSystem.getList();
  const p1 = players.find(p => p.isPlayer1);

  return [p1!.general.card, p1?.opponent.general.card] as [Unit, Unit];
});

const colors = computed(() =>
  generals.value.map(general => FACTION_COLORS[general.blueprint.faction!.id])
);
</script>

<template>
  <div class="loading-screen" :style="{ '--color-1': colors[0], '--color-2': colors[1] }">
    <Transition appear>
      <CardSprite
        class="general p1"
        :sprite-id="generals[0].blueprint.spriteId"
        :pedestal-id="generals[0].pedestalId"
      />
    </Transition>
    <div>VS</div>
    <Transition appear>
      <CardSprite
        class="general p2"
        :sprite-id="generals[1].blueprint.spriteId"
        :pedestal-id="generals[1].pedestalId"
      />
    </Transition>
  </div>
</template>

<style scoped lang="postcss">
.loading-screen {
  position: fixed;
  z-index: 99999;
  inset: 0;

  display: grid;
  place-content: center;

  font-size: 8rem;
  font-weight: var(--font-weight-7);

  background: linear-gradient(
      135deg,
      var(--color-1),
      transparent 50%,
      transparent 50%,
      var(--color-2)
    ),
    url('/assets/backgrounds/loading.jpg');
  background-size: cover, cover;
  background-blend-mode: overlay;

  -webkit-text-fill-color: black;
  -webkit-text-stroke: 2px white;
  > div {
    filter: drop-shadow(6px 6px 0 var(--cyan-5)) drop-shadow(-6px -6px 0 var(--orange-5));
  }
}

.general {
  transform-origin: center;
  aspect-ratio: 1;
  width: 150px;
  &:deep(> div) {
    transform: translateX(-50%) translateY(-50px);
  }
}

.p1 {
  position: absolute;
  top: 25%;
  left: 15%;
  transform: scale(3);
  &.v-enter-active {
    transition: all 0.3s var(--ease-2);
  }
  &.v-enter-from {
    translate: -200px;
    opacity: 0;
  }
}

.p2 {
  position: absolute;
  right: 15%;
  bottom: 25%;
  transform: scaleX(-3) scaleY(3);
  &.v-enter-active {
    transition: all 0.3s var(--ease-2);
  }
  &.v-enter-from {
    translate: 200px;
    opacity: 0;
  }
}
</style>

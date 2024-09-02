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
  inset: 0;
  background: linear-gradient(
      135deg,
      var(--color-1),
      transparent 50%,
      transparent 50%,
      var(--color-2)
    ),
    url('/assets/backgrounds/loading.jpg');
  background-blend-mode: overlay;
  background-size: cover, cover;
  z-index: 99999;
  font-size: 8rem;
  font-weight: var(--font-weight-7);
  -webkit-text-fill-color: black;
  -webkit-text-stroke: 2px white;
  display: grid;
  place-content: center;
  > div {
    filter: drop-shadow(6px 6px 0 var(--cyan-5)) drop-shadow(-6px -6px 0 var(--orange-5));
  }
}

.general {
  width: 150px;
  aspect-ratio: 1;
  transform-origin: center;
  &:deep(> div) {
    transform: translateX(-50%) translateY(-50px);
  }
}

.p1 {
  transform: scale(3);
  position: absolute;
  top: 25%;
  left: 15%;
  &.v-enter-active {
    transition: all 0.3s var(--ease-2);
  }
  &.v-enter-from {
    opacity: 0;
    translate: -200px;
  }
}

.p2 {
  transform: scaleX(-3) scaleY(3);
  position: absolute;
  bottom: 25%;
  right: 15%;
  &.v-enter-active {
    transition: all 0.3s var(--ease-2);
  }
  &.v-enter-from {
    opacity: 0;
    translate: 200px;
  }
}
</style>

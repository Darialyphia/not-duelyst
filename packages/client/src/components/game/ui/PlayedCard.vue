<script setup lang="ts">
import type { Artifact, Card, Spell, Unit } from '@game/sdk';
import type { Nullable, Prettify } from '@game/shared';

const { session, gameType } = useGame();

const latestCard = ref<Nullable<Card>>(null);

session.on('card:before_played', card => {
  latestCard.value = card as any;
  setTimeout(() => {
    latestCard.value = null;
  }, 2000);
});

const userPlayer = useUserPlayer();

const isDisplayed = computed(() => {
  if (!latestCard.value) return false;
  if (gameType.value === 'spectator') return true;

  latestCard && latestCard.value.player.equals(userPlayer.value);
});
</script>

<template>
  <Transition :duration="500">
    <div v-if="isDisplayed && latestCard" class="wrapper">
      <Card
        :has-modal="false"
        :card="{
          blueprintId: latestCard.blueprint.id,
          name: latestCard.blueprint.name,
          description: latestCard.blueprint.description,
          kind: latestCard.kind,
          spriteId: latestCard.blueprint.spriteId,
          rarity: latestCard.blueprint.rarity,
          attack: (latestCard as any).attack,
          hp: (latestCard as any).maxHp,
          speed: (latestCard as any).speed,
          cost: latestCard.cost,
          pedestalId: latestCard.pedestalId,
          cardbackId: latestCard.cardBackId,
          faction: latestCard.blueprint.faction,
          tags: latestCard.blueprint.tags ?? []
        }"
      />
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.wrapper {
  pointer-events: none;

  position: absolute;
  z-index: 9999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &:is(.v-enter-active, .v-leave-active) > div {
    transition: all 0.5s ease-in-out;
  }

  &.v-enter-from > div {
    transform: rotateY(180deg) scale(0);
    opacity: 0;
  }

  &.v-leave-to > div {
    transform: translateY(-80px);
    opacity: 0;
  }
}
</style>

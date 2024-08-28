<script setup lang="ts">
import { CARD_KINDS, type CardBlueprint } from '@game/sdk';
import { match } from 'ts-pattern';

defineOptions({
  inheritAttrs: false
});

const { canAddToLoadout, isEditingLoadout, card } = defineProps<{
  canAddToLoadout: boolean;
  isEditingLoadout: boolean;
  card: {
    card: CardBlueprint;
    cardId: string;
    pedestalId: string;
    cardBackId: string;
  };
  animated?: boolean;
}>();

const animation = computed(() => {
  return match(card.card.kind)
    .with(CARD_KINDS.GENERAL, CARD_KINDS.MINION, () => 'breathing' as const)
    .with(CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, () => 'default' as const)
    .exhaustive();
});

const isUnit = computed(
  () => card.card.kind === CARD_KINDS.GENERAL || card.card.kind === CARD_KINDS.MINION
);

const isDetailsModalOpened = ref(false);
</script>

<template>
  <div class="relative" @contextmenu.prevent="isDetailsModalOpened = true">
    <div class="sprite" :class="card.card.kind.toLowerCase()">
      <CardSprite
        v-if="card.card.spriteId"
        class="sprite"
        :sprite-id="card.card.spriteId"
        :pedestal-id="isUnit ? (card.pedestalId ?? 'pedestal-default') : undefined"
        :animation="animation"
      />
    </div>
    <template v-if="isUnit">
      <div class="attack">{{ card.card.attack }}</div>
      <div class="hp">{{ card.card.maxHp }}</div>
    </template>
    <div class="name">{{ card.card.name }}</div>

    <CardModal
      v-model:is-opened="isDetailsModalOpened"
      :blueprint-id="card.card.id"
      :cardback-id="card.cardBackId"
    />
  </div>
</template>

<style scoped lang="postcss">
.cosmetics-toggle {
  --ui-icon-button-size: var(--size-5);

  position: absolute;
  top: -0.8rem;
  right: -0.5rem;

  &:is(.v-enter-active, .v-leave-active) {
    transition: opacity 0.2s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
}

.sprite {
  height: 64px;
}
.name {
  font-size: var(--font-size-0);
  text-align: center;
  text-shadow: black 0px 2px 1px;
}

.attack,
.hp {
  position: absolute;
  top: 40px;

  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: 19px;

  font-size: var(--font-size-0);
}

.attack {
  left: var(--size-2);
  background-image: url('/assets/ui/unit-attack.png');
}

.hp {
  right: var(--size-2);
  background-image: url('/assets/ui/unit-hp.png');
}
</style>

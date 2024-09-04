<script setup lang="ts">
import { KEYWORDS, type Card, type CardBlueprint } from '@game/sdk';
import { isDefined } from '@game/shared';

const { index, blueprint, cost, attack, maxHp, pedestalId, cardBackId } = defineProps<{
  index: number;
  blueprint: CardBlueprint;
  cost: number;
  attack?: number;
  maxHp?: number;
  pedestalId: string;
  cardBackId: string;
}>();
const { ui, currentTutorialStep } = useGame();

const userPlayer = useUserPlayer();

const card = computed(() => userPlayer.value.hand[index]);
const hasEssence = () => {
  return (
    card.value.modifiers.some(m => m.id === KEYWORDS.ESSENCE.id) &&
    card.value.meta.essence
  );
};
const isEssenceEnabled = ref(hasEssence());
const canPlay = ref(userPlayer.value.canPlayCardAtIndex(index));

useSessionEvent('scheduler:flushed', () => {
  // :yussy:
  setTimeout(() => {
    isEssenceEnabled.value = hasEssence();
    canPlay.value = userPlayer.value.canPlayCardAtIndex(index);
  }, 50);
});
const isDisabled = computed(
  () =>
    !canPlay.value ||
    (isDefined(currentTutorialStep.value?.highlightedCardIndex) &&
      currentTutorialStep.value.highlightedCardIndex !== index)
);
</script>

<template>
  <Sound sound="button-hover.m4a" :triggers="['mouseenter']">
    <Sound sound="board-click.m4a" :triggers="['mousedown']">
      <Card
        class="card"
        :class="{
          disabled: isDisabled,
          essence: isEssenceEnabled
        }"
        :card="{
          blueprintId: blueprint.id,
          name: blueprint.name,
          description: blueprint.description,
          kind: blueprint.kind,
          spriteId: blueprint.spriteId,
          rarity: blueprint.rarity,
          attack: attack,
          hp: maxHp,
          speed: blueprint.speed,
          cost: cost,
          pedestalId: pedestalId,
          cardbackId: cardBackId,
          faction: blueprint.faction,
          tags: blueprint.tags ?? []
        }"
        @contextmenu.prevent="ui.highlightedCard.value = userPlayer.hand[index]"
      />
    </Sound>
  </Sound>
</template>

<style scoped lang="postcss">
@keyframes essence-glow {
  0%,
  100% {
    box-shadow: inset 0 0 1rem 1rem hsl(var(--cyan-6-hsl) / 1);
  }
  50% {
    box-shadow: inset 0 0 1rem 0.5rem hsl(var(--cyan-6-hsl) / 0.5);
  }
}
.card {
  position: relative;

  &.disabled {
    filter: grayscale(70%) brightness(70%) contrast(100%);
  }

  &.essence::after {
    pointer-events: none;
    content: '';

    position: absolute;
    z-index: 1;
    inset: 0;

    border-radius: var(--radius-3);

    animation: essence-glow 3s ease infinite;
  }
}
</style>

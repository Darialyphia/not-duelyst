<script setup lang="ts">
import type { Card, CardBlueprint } from '@game/sdk';
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
</script>

<template>
  <Sound sound="button-hover" :triggers="['mouseenter']">
    <Sound sound="button-click" :triggers="['mousedown']">
      <Card
        class="card"
        :class="{
          disabled:
            !userPlayer.canPlayCardAtIndex(index) ||
            (isDefined(currentTutorialStep?.highlightedCardIndex) &&
              currentTutorialStep.highlightedCardIndex !== index)
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
.card {
  position: relative;

  &.disabled {
    filter: grayscale(70%) brightness(70%) contrast(100%);
  }
}
</style>

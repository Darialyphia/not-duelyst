<script setup lang="ts">
import { CARDS } from '@game/sdk';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';

const { blueprintId } = defineProps<{ blueprintId: string }>();

const card = parseSerializeBlueprint(CARDS[blueprintId]);
</script>

<template>
  <div class="wrapper">
    <Card
      :has-modal="false"
      :card="{
        blueprintId: card.id,
        name: card.name,
        description: card.description,
        kind: card.kind,
        spriteId: card.spriteId,
        rarity: card.rarity,
        attack: card.attack,
        hp: card.maxHp,
        speed: card.speed,
        cost: card.cost,
        faction: card.faction,
        tags: card.tags ?? []
      }"
    />
    <div>
      <slot />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-block: var(--size-6);
}
</style>

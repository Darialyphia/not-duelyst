<script setup lang="ts">
import { type CardKind } from '@game/sdk';
import { type Rarity } from '@game/sdk/src/card/card-utils';

type ICard = {
  kind: CardKind;
  name: string;
  description: string;
  spriteId: string;
  rarity: Rarity;
  attack?: number;
  hp?: number;
  cost: number;
};
const { card } = defineProps<{ card: ICard }>();
</script>

<template>
  <div class="card">{{ card.name }}</div>
</template>

<style scoped lang="postcss">
.card {
  position: relative;
  width: 226px;
  height: 297px;
  padding: 0.8rem 0.6rem;
}
</style>

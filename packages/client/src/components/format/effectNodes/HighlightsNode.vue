<script setup lang="ts">
import type { CellConditionBase, Filter } from '@game/sdk';

const highlights = defineModel<Filter<CellConditionBase>>({ required: true });

useCellConditionsProvider(
  ref({
    summon_target: { label: 'Where the played card is summoned (units only)', params: [] }
  })
);
useUnitConditionsProvider(ref({}));
useCardConditionsProvider(ref({}));
usePlayerConditionsProvider(ref({}));
</script>

<template>
  <div class="highlights-node">
    <CellNode v-model="highlights" />
  </div>
</template>

<style scoped lang="postcss">
.highlights-node {
  margin-block: var(--size-3);
  padding: var(--size-3);
  background-color: hsl(0 0 100% / 0.03);
  border: solid var(--border-size-1) var(--border-dimmed);
}
</style>

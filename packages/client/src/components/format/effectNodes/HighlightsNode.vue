<script setup lang="ts">
import type { CellConditionBase } from '@game/sdk';

const highlights = defineModel<CellConditionBase[][]>({ required: true });

useCellConditionsProvider(
  ref({
    summon_target: { label: 'Where the played card is summoned (units only)', params: [] }
  })
);
useUnitConditionsProvider(ref({}));
useCardConditionsProvider(ref({}));
useArtifactConditionsProvider();
usePlayerConditionsProvider(ref({}));

const vModel = computed({
  get() {
    return { candidates: highlights.value, random: false };
  },
  set(val) {
    highlights.value = val.candidates;
  }
});
</script>

<template>
  <div class="highlights-node">
    <CellNode v-model="vModel" />
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

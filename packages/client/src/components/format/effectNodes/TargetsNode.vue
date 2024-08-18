<script setup lang="ts">
import type { CardTargetsConfig } from '@game/sdk';

const targets = defineModel<CardTargetsConfig>({ required: true });

useCellConditionsProvider(
  ref({
    summon_target: { label: 'Where the played card is summoned (units only)', params: [] }
  })
);
useUnitConditionsProvider(ref({}));
useCardConditionsProvider(ref({}));
useArtifactConditionsProvider();
usePlayerConditionsProvider(ref({}));

const groupsVModel = computed({
  get() {
    return targets.value.targets.map(t => ({
      candidates: t,
      random: false
    }));
  },
  set(val) {
    targets.value.targets = val.map(v => v.candidates);
  }
});
</script>

<template>
  <div class="targets-node">
    <label for="min-targets">Minimum targets</label>
    <UiTextInput
      id="min-targets"
      v-model.number="targets.min"
      type="number"
      step="1"
      :max="targets.targets.length"
    />
    <div v-for="(target, index) in targets.targets" :key="index" class="target">
      <CellNode v-model="groupsVModel[index]" />
      <UiButton class="error-button" @click="targets.targets.splice(index, 1)">
        Remove target
      </UiButton>
    </div>
    <UiButton
      class="subtle-button w-full"
      @click="targets.targets.push([[{ type: undefined as any }]])"
    >
      Add target
    </UiButton>
  </div>
</template>

<style scoped lang="postcss">
.target {
  margin-block: var(--size-3);
  padding: var(--size-3);
  background-color: hsl(0 0 100% / 0.03);
  border: solid var(--border-size-1) var(--border-dimmed);
}
</style>

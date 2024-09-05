<script setup lang="ts">
import { CARDS } from '@game/sdk';

const blueprintIds = defineModel<string[]>({ required: true });

const format = useFormat();

const allCards = computed(() => ({ ...format.value.cards, ...CARDS }));
const options = computed(() =>
  Object.entries(allCards.value)
    .map(([key, value]) => ({
      label: value.name,
      value: key
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
);
</script>

<template>
  <div>
    <UiCombobox
      v-model="blueprintIds"
      :options="options"
      multiple
      placeholder="Select a card"
    />
    <div v-auto-animate class="flex gap-2 wrap mt-3">
      <div v-for="(id, index) in blueprintIds" :key="id" class="choice">
        {{ allCards[id].name }}

        <UiIconButton
          name="mdi:close"
          type="button"
          @click="blueprintIds.splice(index, 1)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.choice {
  --ui-button-bg: transparent;
  --ui-button-hover-bg: hsl(var(--color-error-hover-hsl) / 0.2);
  --ui-button-color: var(--error);

  display: flex;
  gap: var(--size-2);
  align-items: center;

  padding: var(--size-1) var(--size-1) var(--size-1) var(--size-3);

  color: var(--text-on-primary);

  background-color: var(--primary);
  border-radius: var(--radius-pill);
}
</style>

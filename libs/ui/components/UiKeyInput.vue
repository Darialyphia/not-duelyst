<script setup lang="ts">
import { keyToString } from 'key-display-names';
export type KeyBinding = { key: string; modifier: 'shift' | 'ctrl' | 'alt' | null };
const control = defineModel<KeyBinding>({ required: true });

const isEditing = ref(false);

const MODIFIER_PREFIXES = ['Shift', 'Control', 'Alt'];

const formattedKey = computed(() => {
  return keyToString(control.value.key);
});

const label = computed(() => {
  if (isEditing.value) return 'Press a key or Esc to cancel';

  if (control.value.modifier)
    return `<kbd>${control.value.modifier}</kbd> + <kbd>${formattedKey.value}</kbd>`;

  return `<kbd>${formattedKey.value}</kbd>`;
});

const onKeydown = (e: KeyboardEvent) => {
  if (!isEditing.value) return;

  e.stopPropagation();
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
  }
  if (e.code === 'Escape') {
    isEditing.value = false;
    return;
  }

  const isModifier = MODIFIER_PREFIXES.some(prefix => e.code.startsWith(prefix));
  if (isModifier) return;

  let modifier: KeyBinding['modifier'] = null;
  if (e.shiftKey) modifier = 'shift';
  else if (e.ctrlKey) modifier = 'ctrl';
  else if (e.altKey) modifier = 'alt';

  control.value = {
    key: e.code,
    modifier
  };
  isEditing.value = false;
};
</script>

<template>
  <button @click="isEditing = true" @keydown="onKeydown" v-html="label" />
</template>

<style scoped lang="postcss">
button {
  width: var(--size-13);
  padding: var(--size-2);
  border: var(--fancy-border);
  &:focus {
    filter: brightness(130%);
  }
}
</style>

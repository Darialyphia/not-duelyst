<script setup lang="ts">
const { pageCount, page } = defineProps<{
  page: number;
  pageCount: number;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
}>();
</script>

<template>
  <footer class="fancy-surface border-none">
    <UiButton class="ghost-button p-0" @click="emit('prev')">
      <Icon name="ic:baseline-keyboard-arrow-left" size="2em" />
    </UiButton>
    {{ page + 1 }} / {{ pageCount }}
    <UiButton class="ghost-button p-0" @click="emit('next')">
      <Icon name="ic:baseline-keyboard-arrow-right" size="2em" />
    </UiButton>
  </footer>
</template>

<style scoped lanh="postcss">
footer {
  display: flex;
  gap: var(--size-3);
  align-items: center;
  justify-content: center;

  padding: var(--size-1);

  box-shadow: none;
}
</style>

<script setup lang="ts">
const isOpened = defineModel<boolean>('isOpened', { required: true });
const { description } = defineProps<{ description: string }>();
const emit = defineEmits<{ ok: [] }>();
</script>

<template>
  <UiModal v-model:is-opened="isOpened" title="Delete loadout" :description="description">
    <div class="flex gap-5 justify-around mt-6">
      <UiButton class="ghost-button" @click="isOpened = false">Cancel</UiButton>
      <UiButton class="error-button" @click="emit('ok')">OK</UiButton>
    </div>
  </UiModal>
</template>

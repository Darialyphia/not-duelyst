<script setup lang="ts">
const isOpened = defineModel<boolean>('isOpened', { required: true });
const { description, isDestructive } = defineProps<{
  description: string;
  isDestructive?: boolean;
}>();
const emit = defineEmits<{ ok: [] }>();
</script>

<template>
  <UiModal v-model:is-opened="isOpened" title="Delete loadout" :description="description">
    <div class="flex gap-5 justify-end mt-6">
      <UiButton class="ghost-button" @click="isOpened = false">Cancel</UiButton>
      <UiButton class="error-button min-w-11" is-cta @click="emit('ok')">OK</UiButton>
    </div>
  </UiModal>
</template>

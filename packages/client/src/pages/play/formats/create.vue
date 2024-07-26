<script setup lang="ts">
import { api } from '@game/api';
import { defaultConfig } from '@game/sdk';

definePageMeta({
  name: 'CreateFormat',
  pageTransition: {
    name: 'create-format-page',
    mode: 'out-in',
    appear: true
  }
});

const { mutate: createFormat } = useConvexAuthedMutation(api.formats.create, {
  onSuccess() {
    navigateTo({ name: 'FormatList' });
  }
});
</script>

<template>
  <div class="page">
    <FormatForm
      :initial-values="{
        name: 'My new format',
        description: 'Format description',
        config: {
          ...defaultConfig
        },
        cards: {}
      }"
      @submit="createFormat($event)"
    />
  </div>
</template>

<style lang="postcss">
.create-format-page-enter-active,
.create-format-page-leave-active {
  transition: all 0.3s;
}
.create-format-page-enter-from,
.create-format-page-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>
<style scoped lang="postcss">
.page {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>

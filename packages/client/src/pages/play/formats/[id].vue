<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';

definePageMeta({
  name: 'EditFormat',
  pageTransition: {
    name: 'edit-format-page',
    mode: 'out-in',
    appear: true
  }
});

const route = useRoute();
const { isLoading, data: format } = useConvexAuthedQuery(api.formats.byId, {
  id: route.params.id as Id<'formats'>
});

const { mutate: updateFormat } = useConvexAuthedMutation(api.formats.update, {
  onSuccess() {
    navigateTo({ name: 'FormatList' });
  }
});

const initialValues = computed(() => {
  const { name, description, config, cards } = format.value;

  return {
    name,
    description,
    config: { ...config },
    cards: structuredClone(toRaw(cards))
  };
});
</script>

<template>
  <div v-if="isLoading">Loading format...</div>
  <div v-else-if="format" class="page">
    <FormatForm
      :initial-values="initialValues"
      @submit="updateFormat({ id: format._id, ...$event })"
    />
  </div>
</template>

<style lang="postcss">
.edit-format-page-enter-active,
.edit-format-page-leave-active {
  transition: all 0.3s;
}
.edit-format-page-enter-from,
.edit-format-page-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>
<style scoped lang="postcss">
.page {
  overflow: hidden;
  height: 100dvh;
}
</style>

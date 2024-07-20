<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import { defaultConfig } from '@game/sdk';

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
  const { name, description, config } = format.value;
  return { name, description, config };
});
</script>

<template>
  <div class="page container pt-8 px-5" style="--container-size: var(--size-md)">
    <header>
      <BackButton :to="{ name: 'FormatList' }" />
      <h1 v-if="format">{{ format.name }}</h1>
    </header>

    <div v-if="isLoading">Loading format...</div>
    <FormatForm
      v-else-if="format"
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
  display: flex;
  flex-direction: column;
  height: 100%;
  > header {
    margin-bottom: var(--size-5);
    text-shadow: black 0px 4px 1px;
  }
}
</style>

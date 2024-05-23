<script setup lang="ts">
import { api } from '@game/api';
import { object, string } from 'zod';

const { data: me, isLoading } = useConvexAuthedQuery(api.users.me, {});

const isOpened = computed(() => {
  if (isLoading.value) return false;
  return !!me.value && me.value.name === 'Anonymous' && me.value?.hasOnboarded;
});

const { mutate: signup, isLoading: isSubmitting } = useConvexAuthedMutation(
  api.users.completeSignUp
);

const schema = toTypedSchema(
  object({
    name: string()
  })
);
</script>

<template>
  <UiModal
    :is-opened="isOpened"
    title="Almost there!"
    description="We just need you to choose a username below"
    :style="{ '--ui-modal-size': 'var(--size-sm)' }"
  >
    <VeeForm
      :validation-schema="schema"
      class="grid gap-3"
      @submit="values => signup({ ...(values as any) })"
    >
      <div class="flex gap-3 items-center mt-4">
        <VeeField name="name" />
        <VeeErrorMessage name="name" class="text-red-5" />
      </div>

      <UiButton :disbaled="isSubmitting" class="primary-button">Continue</UiButton>
    </VeeForm>
  </UiModal>
</template>

<style scoped>
input {
  display: block;
  border: var(--fancy-border);
}
</style>

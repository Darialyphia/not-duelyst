<script setup lang="ts">
import { api } from '@hc/api';
import { object, string } from 'zod';

const sessionId = useSessionId();
const { data: me, isLoading } = useConvexQuery(
  api.users.me,
  computed(() => ({ sessionId: sessionId.value }))
);

const isOpened = computed(() => {
  if (isLoading.value) return false;
  return !!sessionId.value && !me.value?.name;
});

const { mutate: signup, isLoading: isSubmitting } = useConvexMutation(
  api.users.completeSignUp
);

const schema = toTypedSchema(
  object({
    name: string()
  })
);
</script>

<template>
  <DialogRoot :open="isOpened" modal>
    <DialogPortal>
      <DialogOverlay class="modal-overlay" />
      <DialogContent class="modal-content">
        <div class="fancy-surface">
          <DialogTitle>Almost there !</DialogTitle>
          <DialogDescription>
            We just need you to choose a username below
          </DialogDescription>

          <VeeForm
            :validation-schema="schema"
            @submit="values => signup({ ...(values as any), sessionId })"
          >
            <VeeField name="name" />
            <VeeErrorMessage name="name" class="text-red-5" />

            <UiButton :disbaled="isSubmitting" class="primary-button">Continue</UiButton>
          </VeeForm>
        </div>
        <DialogClose />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 1;
  inset: 0;
  background-color: hsl(var(--gray-12-hsl) / 0.5);
}

.modal-content {
  position: fixed;
  z-index: 2;
  inset: 0;

  display: grid;
  place-content: center;
}

input {
  display: block;
  border: var(--fancy-border);
}
</style>

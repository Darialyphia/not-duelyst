<script setup lang="ts">
import { api } from '@hc/api';
import { object, string } from 'zod';

const { data: me } = useConvexQuery(api.users.me, {});
const { isAuthenticated } = useConvexAuth();
const isOpened = computed(() => {
  return isAuthenticated.value && me.value === null;
});

const { mutate: signup, isLoading } = useConvexMutation(api.users.signUp);

const schema = toTypedSchema(
  object({
    name: string()
  })
);
</script>

<template>
  <DialogRoot :open="isOpened">
    <DialogPortal>
      <DialogOverlay class="modal-overlay" />
      <DialogContent class="modal-content">
        <div class="surface">
          <DialogTitle>Almost there !</DialogTitle>
          <DialogDescription>
            We just need you to choose a username below
          </DialogDescription>

          <VeeForm @submit="values => signup(values as any)" :validation-schema="schema">
            <VeeField name="name" />
            <VeeErrorMessage name="name" />

            <button :disbaled="isLoading">Continue</button>
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
</style>

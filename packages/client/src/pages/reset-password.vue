<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  middleware: ['public'],
  name: 'ResetPassword',
  layout: 'auth'
});

const route = useRoute();
const formData = reactive({
  password: '',
  passwordConfirm: ''
});
const session = useSession();

const { isLoading, mutate, error } = useConvexMutation(api.auth.resetPassword, {
  onSuccess(data) {
    session.value = data;
    navigateTo({ name: 'ClientHome' });
  }
});

const onSubmit = () => {
  if (formData.password !== formData.passwordConfirm) return;

  mutate({
    sessionId: null,
    password: formData.password,
    token: route.query.token as string
  });
};
</script>

<template>
  <form @submit.prevent="onSubmit">
    <h2 class="mb-4">Reset your password</h2>

    <label>New Password</label>
    <input v-model="formData.password" type="password" />

    <label>Confirm your new passowrd</label>
    <input v-model="formData.passwordConfirm" type="password" />

    <UiButton
      :is-loading="isLoading"
      class="primary-button"
      :disabled="!formData.password || formData.password !== formData.password"
    >
      Confirm
    </UiButton>
    <Transition>
      <p v-if="error" class="color-red-5 mt-2">{{ error }}</p>
    </Transition>
  </form>
</template>

<style scoped lang="postcss">
form {
  --transform: translateY(var(--size-7));

  display: grid;
  padding: var(--size-6) var(--size-8) var(--size-4);
  border-radius: var(--radius-3);
  > input {
    margin-block-end: var(--size-5);
    border: var(--fancy-border);
  }

  > span {
    margin: var(--size-3) auto 0;
    &::before,
    &::after {
      content: ' - ';
    }
  }
  > button {
    width: fit-content;
    min-width: 14ch;
    margin-inline: auto;
  }
}

label {
  font-weight: var(--font-weight-5);
}

p {
  &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateY(calc(-1 * var(--size-2)));
    opacity: 0;
  }
}
</style>

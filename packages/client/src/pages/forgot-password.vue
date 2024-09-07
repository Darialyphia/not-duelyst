<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  middleware: ['public'],
  name: 'ForgotPassword',
  layout: 'auth'
});

const formData = reactive({
  email: ''
});

const isSuccess = ref(false);
const { isLoading, mutate, error } = useConvexMutation(
  api.auth.generatePasswordResetLink,
  {
    onSuccess() {
      isSuccess.value = true;
    }
  }
);
</script>

<template>
  <form @submit.prevent="mutate(formData)">
    <h2 class="mb-4">Forgot your password</h2>
    <p class="mb-5">
      Fill out your email-adress and you will receive an e-mail with a link to reset your
      password.
    </p>
    <label>E-mail address</label>
    <input v-model="formData.email" type="email" />

    <UiButton :is-loading="isLoading" class="primary-button">
      Send password reset link
    </UiButton>
    <Transition>
      <p v-if="error" class="color-red-5 mt-2">{{ error }}</p>
    </Transition>

    <Transition>
      <p v-if="isSuccess" class="color-green-5 mt-2">
        All done ! Check your inbox for the password reset e-mail.
      </p>
    </Transition>

    <NuxtLink v-slot="{ href, navigate }" custom :to="{ name: 'Login' }">
      <UiButton
        :is-loading="isLoading"
        is-fullwidth
        class="link-button"
        :href="href"
        @click="navigate"
      >
        Back to login
      </UiButton>
    </NuxtLink>
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

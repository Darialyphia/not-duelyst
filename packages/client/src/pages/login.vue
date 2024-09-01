<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  middleware: ['public'],
  name: 'Login',
  layout: 'auth'
});

const formData = reactive({
  email: '',
  password: ''
});

const { isLoading, mutate: login, error } = useSignIn();

const isReady = ref(false);
onMounted(() => {
  // Removed the loader code before the SPA got loaded
  const loader = document.getElementById('app-loader');
  if (!loader) {
    isReady.value = true;
    return;
  }

  loader.addEventListener('animationend', () => {
    loader.remove();
    isReady.value = true;
  });
  loader.classList.add('loader-fadeout');
});
</script>

<template>
  <form @submit.prevent="login({ ...formData, sessionId: null })">
    <h2 class="mb-4">Login</h2>
    <label>E-mail address</label>
    <input v-model="formData.email" type="email" />

    <label>Password</label>
    <input v-model="formData.password" type="password" />

    <UiButton :is-loading="isLoading" class="primary-button">Login</UiButton>
    <Transition>
      <p v-if="error" class="color-red-5 mt-2">{{ error }}</p>
    </Transition>
    <span>OR</span>
    <NuxtLink v-slot="{ href, navigate }" custom :to="{ name: 'SignUp' }">
      <UiButton
        :is-loading="isLoading"
        is-fullwidth
        class="link-button"
        :href="href"
        @click="navigate"
      >
        Create an account
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
    margin-block-end: var(--size-3);
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

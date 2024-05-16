<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  name: 'SignUp',
  middleware: ['public'],
  layout: 'auth'
});

const formData = reactive({
  email: '',
  password: ''
});

const { push } = useRouter();
const { mutate: signup, isLoading } = useConvexMutation(api.auth.signUp, {
  onSuccess() {
    push({ name: 'Login' });
  }
});

const onSubmit = () => {
  signup({ ...formData, sessionId: null });
};
</script>

<template>
  <form @submit.prevent="onSubmit">
    <h2 class="mb-4">Sign up</h2>
    <label>E-mail address</label>
    <input v-model="formData.email" type="email" />

    <label>Password</label>
    <input v-model="formData.password" type="password" />

    <UiFancyButton class="primary-button" :is-loading="isLoading">
      Create account
    </UiFancyButton>
    <span>OR</span>
    <NuxtLink custom :to="{ name: 'Login' }" v-slot="{ href, navigate }">
      <UiButton
        :is-loading="isLoading"
        is-cta
        class="link-button"
        :href="href"
        @click="navigate"
      >
        Login
      </UiButton>
    </NuxtLink>
  </form>
</template>

<style scoped lang="postcss">
form {
  display: grid;
  padding: var(--size-6) var(--size-8) var(--size-4);

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
</style>

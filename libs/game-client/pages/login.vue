<script setup lang="ts">
definePageMeta({
  middleware: ['public'],
  name: 'Login'
});

const formData = reactive({
  email: '',
  password: ''
});

const onSubmit = () => {
  $fetch('/api/signin', {
    method: 'POST',
    body: formData
  });
};
</script>

<template>
  <div class="grid place-content-center h-screen">
    <h2>Login</h2>
    <form class="fancy-surface" @submit.prevent="onSubmit">
      <label>E-mail address</label>
      <input v-model="formData.email" type="email" />

      <label>Password</label>
      <input v-model="formData.password" type="password" />

      <UiButton>Login</UiButton>
    </form>
  </div>
</template>

<style scoped lang="postcss">
form {
  display: grid;

  > input {
    margin-block-end: var(--size-3);
    border: var(--fancy-border);
  }
}
</style>

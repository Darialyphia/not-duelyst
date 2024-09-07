<script setup lang="ts">
import { api } from '@game/api';
import { toTypedSchema } from '@vee-validate/zod';
import type { ConvexError } from 'convex/values';
import * as z from 'zod';

definePageMeta({
  name: 'SignUp',
  middleware: ['public'],
  layout: 'auth'
});

const validationSchema = toTypedSchema(
  z
    .object({
      email: z
        .string()
        .min(1, { message: 'Email is required.' })
        .email({ message: 'That email address is not valid.' }),
      password: z
        .string()
        .min(1, { message: 'Password is required' })
        .min(6, { message: 'Password must be at least 6 characters.' }),
      passwordConfirm: z.string().min(1, { message: 'Password confirmation is required' })
    })
    .superRefine((values, ctx) => {
      if (values.password !== values.passwordConfirm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          fatal: true,
          message: "Passwords don't match",
          path: ['passwordConfirm']
        });
      }
    })
);

const { isLoading: isLoginLoading, mutate: login } = useSignIn( () => navigateTo({ name: 'Login' }));


const form = useForm({ validationSchema });
const [email, emailProps] = form.defineField('email', {
  validateOnInput: false,
  validateOnModelUpdate: false,
  validateOnBlur: false
});
const [password, passwordProps] = form.defineField('password', {
  validateOnInput: false,
  validateOnModelUpdate: false,
  validateOnBlur: false
});
const [passwordConfirm, passwordConfirmProps] = form.defineField('passwordConfirm', {
  validateOnInput: false,
  validateOnModelUpdate: false
});

const {
  mutate: signup,
  isLoading,
  error
} = useConvexMutation(api.auth.signUp, {
  onSuccess() {
    login({
        email: form.values.email!,
        password: form.values.password!,
        sessionId: null
    });
  }
});

const onSubmit = form.handleSubmit(({ email, password }) => {
  signup({ email, password, sessionId: null });
});
</script>

<template>
  <form @submit.prevent="onSubmit">
    <h2 class="mb-4">Sign up</h2>
    <fieldset>
      <label>E-mail address</label>
      <input v-model="email" type="email" v-bind="emailProps" />
      <p class="color-red-5">{{ form.errors.value.email }}</p>
    </fieldset>

    <fieldset>
      <label>Password</label>
      <input v-model="password" type="password" v-bind="passwordProps" />
      <p class="color-red-5">{{ form.errors.value.password }}</p>
    </fieldset>

    <fieldset>
      <label>Confirm Password</label>
      <input v-model="passwordConfirm" type="password" v-bind="passwordConfirmProps" />
      <p class="color-red-5">{{ form.errors.value.passwordConfirm }}</p>
    </fieldset>

    <UiButton class="primary-button" :is-loading="isLoading || isLoginLoading">
      Create account
    </UiButton>
    <Transition>
      <p v-if="error" class="color-red-5 mt-2">{{ (error as ConvexError<string>).data }}</p>
    </Transition>
    <span>OR</span>
    <NuxtLink v-slot="{ href, navigate }" custom :to="{ name: 'Login' }">
      <UiButton
        :is-loading="isLoading || isLoginLoading"
        is-fullwidth
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

  > fieldset {
    display: grid;
    margin-block-end: var(--size-3);
    > input {
      border: var(--fancy-border);
    }
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
</style>

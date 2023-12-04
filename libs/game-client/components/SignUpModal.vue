<script setup lang="ts">
// import { api } from '@hc/api';
// import { toTypedSchema } from '@vee-validate/zod';
// import { object } from 'zod';

// const me = useQuery(api.users.me, []);
// const { isAuthenticated } = useConvexAuth();
// const isOpened = computed(() => {
//   return isAuthenticated.value && me.value === null;
// });

// const { mutate: signup, isLoading } = useMutation(api.users.signUp);

// const { handleSubmit } = useForm({
//   validationSchema: toTypedSchema(object(signupInput))
// });

// const onSubmit = handleSubmit(async values => {
//   await signup(values);
// });

// const focus = useFocusOn();

// until(isOpened)
//   .toBe(true)
//   .then(() => {
//     setTimeout(() => {
//       focus('signup-modal');
//     }, 200);
//   });
</script>

<template>
  <div />
  <!-- <UiModal id="signup-modal" :is-closable="false" :is-opened="isOpened">
    <UiModalHeader>Almost there !</UiModalHeader>
    <UiModalContent class="grid gap-3">
      <p>We just need you to choose a username below</p>

      <form class="grid gap-3" @submit="onSubmit">
        <UiFormControl v-slot="{ error, inputProps }" name="name">
          <UiFormLabel for="text">Pick a username ?</UiFormLabel>
          <UiTextInput
            v-bind="inputProps"
            id="text"
            ref="inputEl"
            v-focus-on="'signup-modal'"
          />
          <UiFormError :error="error" :is-always-visible="false" />
        </UiFormControl>

        <UiButton :is-loading="isLoading">Continue</UiButton>
      </form>
    </UiModalContent>
  </UiModal> -->
</template>

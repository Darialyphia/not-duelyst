<script setup lang="ts">
import { api } from '@game/api';
import { object, string } from 'zod';

const sessionId = useSessionId();
const { data: me } = useConvexQuery(
  api.users.me,
  computed(() => ({ sessionId: sessionId.value }))
);

const isOpened = computed(() => {
  return !!sessionId.value && !me.value?.hasOnboarded;
});

const { mutate: skipTutorial, isLoading: isSubmitting } = useConvexAuthedMutation(
  api.users.completeOnboarding
);
</script>

<template>
  <UiModal
    :is-opened="isOpened && $route.name !== 'Tutorial'"
    title="Welcome to Not Duelyst !"
    :closable="false"
  >
    <small>100% certified no Songhai !</small>
    <p>Would you like to play the tutorial ?</p>
    <div class="flex gap-4 mt-5">
      <NuxtLink custom :to="{ name: 'Tutorial' }" v-slot="{ href, navigate }">
        <UiButton
          class="primary-button"
          :disabled="isSubmitting"
          :href="href"
          @click="navigate"
        >
          Sure !
        </UiButton>
      </NuxtLink>
      <UiButton class="ghost-button" :disabled="isSubmitting" @click="skipTutorial({})">
        No thanks !
      </UiButton>
    </div>
  </UiModal>
</template>

<style scoped>
input {
  display: block;
  border: var(--fancy-border);
}
</style>

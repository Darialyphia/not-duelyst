<script setup lang="ts">
import { api } from '@game/api';
import { FEATURE_FLAGS } from '@game/api/src/convex/featureFlags/featureFlags.constants';

const sessionId = useSessionId();
const { data: me } = useConvexAuthedQuery(api.users.me, {});

const { data: featureFlags } = useConvexQuery(api.featureFlags.all, {});
const isOpened = computed(() => {
  if (!featureFlags.value?.[FEATURE_FLAGS.TUTORIAL]) return false;
  if (!sessionId.value) return false;
  if (!me.value) return false;
  return !me.value.hasOnboarded;
});

const { mutate: skipTutorial, isLoading: isSubmitting } = useConvexAuthedMutation(
  api.users.completeOnboarding
);
</script>

<template>
  <UiModal
    :is-opened="isOpened && $route.name !== 'Tutorial'"
    title="Welcome to Darialyst !"
    :closable="false"
  >
    <p class="c-orange-5">
      <span class="text-5">
        <Icon name="ph:warning-octagon" />

        This is a test deployment version !
      </span>
      <br />
      Features and content are missing. Bugs, placeholder content, subpar UI and regular
      account wipes are to be expected.
      <br />
      During this time, all players will have access to all cards and cosmetics.
    </p>
    <p class="mt-4">Would you like to play the tutorial ?</p>
    <div class="flex gap-4 mt-5">
      <NuxtLink v-slot="{ href, navigate }" custom :to="{ name: 'Tutorial' }">
        <UiButton
          class="primary-button"
          :disabled="isSubmitting"
          :href="href"
          @click="navigate"
        >
          Sure !
        </UiButton>
      </NuxtLink>
      <UiButton
        class="ghost-button"
        :disabled="isSubmitting"
        @click="
          skipTutorial({
            skippedTutorial: true
          })
        "
      >
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

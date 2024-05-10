<script setup lang="ts">
const { dispatch, gameType } = useGame();
const { isMenuOpened } = useGameUi();

useEventListener('keydown', e => {
  if (e.code === 'Escape' && !isMenuOpened.value) {
    isMenuOpened.value = true;
  }
});

const isSettingsOpoened = ref(false);
</script>

<template>
  <UiButton
    class="absolute bottom-4 right-4 aspect-1 primary-button"
    :style="{
      '--ui-button-radius': 'var(--radius-round)'
    }"
    @click="isMenuOpened = true"
  >
    <Icon name="material-symbols:settings" size="1.5rem" />
  </UiButton>

  <UiModal v-model:is-opened="isMenuOpened" title="Menu">
    <div class="grid gap-4 menu">
      <!-- <UiButton is-cta @click="isSettingsOpoened = true">Settings</UiButton> -->
      <UiButton v-if="gameType === 'pvp'" @click="dispatch('surrender')">
        Surrender
      </UiButton>
      <NuxtLink v-else v-slot="{ navigate, href }" :to="{ name: 'ClientHome' }" custom>
        <UiButton is-cta :href="href" @click="navigate">Exit game</UiButton>
      </NuxtLink>

      <DialogClose as-child>
        <UiButton is-cta @click="isMenuOpened = false">Resume</UiButton>
      </DialogClose>
    </div>
  </UiModal>

  <!-- <UiModal v-model:is-opened="isSettingsOpoened" title="Settings">
    <SettingsEditor @close="isSettingsOpoened = false" />
  </UiModal> -->
</template>

<style scoped>
.menu :is(a, button) {
  --ui-button-border-color: var(--primary);
  --ui-button-bg-hover: var(--primary-hover);
  --ui-button-bg: transparent;

  &:hover:not(:disabled) {
    color: var(--text-on-primary);
    background-color: var(--primary-hover);
  }
}
</style>

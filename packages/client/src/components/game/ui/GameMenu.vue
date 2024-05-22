<script setup lang="ts">
const { dispatch, gameType } = useGame();
const { isMenuOpened } = useGameUi();

useEventListener('keydown', e => {
  if (e.code === 'Escape' && !isMenuOpened.value) {
    isMenuOpened.value = true;
  }
});

const isSettingsOpened = ref(false);
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

  <UiModal
    v-model:is-opened="isMenuOpened"
    title="Menu"
    :style="{ '--ui-modal-size': 'var(--size-xs)' }"
  >
    <div class="menu">
      <UiButton is-cta @click="isSettingsOpened = true">Settings</UiButton>
      <UiButton
        v-if="gameType === GAME_TYPES.PVP"
        is-cta
        @click="
          () => {
            isSettingsOpened = false;
            dispatch('surrender');
          }
        "
      >
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

  <UiModal
    v-model:is-opened="isSettingsOpened"
    title="Settings"
    :style="{ '--ui-modal-size': 'var(--size-lg)' }"
  >
    <SettingsForm @close="isSettingsOpened = false" />
  </UiModal>
</template>

<style scoped>
.menu {
  display: grid;
  gap: var(--size-4);
}

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

<script setup lang="ts">
const { sendInput } = useGame();
const { isMenuOpened } = useGameUi();

useEventListener('keydown', e => {
  console.log(e);
  if (e.code === 'Escape') {
    isMenuOpened.value = !isMenuOpened.value;
    console.log(isMenuOpened.value);
  }
});

const { playerId } = useGame();
</script>

<template>
  <UiButton @click="isMenuOpened = true">
    <Icon name="material-symbols:settings" size="1.5rem" />
  </UiButton>

  <UiModal v-model:is-opened="isMenuOpened" title="Menu">
    <div class="grid gap-4">
      <UiButton v-if="playerId" @click="sendInput('surrender')">Surrender</UiButton>
      <NuxtLink v-else v-slot="{ navigate, href }" :to="{ name: 'ClientHome' }" custom>
        <UiButton is-cta :href="href" @click="navigate">Quit spectating</UiButton>
      </NuxtLink>

      <DialogClose as-child>
        <UiButton is-cta @click="isMenuOpened = false">Resume</UiButton>
      </DialogClose>
    </div>
  </UiModal>
</template>

<style scoped>
:is(a, button) {
  --d-button-border-color: var(--primary);
  --ui-button-bg-hover: var(--primary-hover);

  &:hover:not(:disabled) {
    color: var(--text-on-primary);
    background-color: var(--primary-hover);
  }
}
</style>

<script setup lang="ts">
const { sendInput } = useGame();
const { isMenuOpened } = useGameUi();

useEventListener('keydown', e => {
  if (e.code === 'Escape' && !isMenuOpened.value) {
    isMenuOpened.value = true;
  }
});

const { playerId } = useGame();
</script>

<template>
  <DialogRoot :open="isMenuOpened" modal>
    <DialogTrigger @click="isMenuOpened = true">
      <Icon name="material-symbols:settings" size="1.5rem" />
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="modal-overlay" />
      <DialogContent class="modal-content" @escape-key-down="isMenuOpened = false">
        <DialogTitle>Menu</DialogTitle>
        <div class="fancy-surface grid gap-4">
          <UiButton v-if="playerId" @click="sendInput('surrender')">Surrender</UiButton>
          <NuxtLink v-else :to="{ name: 'ClientHome' }">Quit spectating</NuxtLink>
          <DialogClose as-child>
            <UiButton @click="isMenuOpened = false" @keydown.stop>Resume</UiButton>
          </DialogClose>
        </div>
        <DialogClose />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 1;
  inset: 0;
  background-color: hsl(var(--gray-12-hsl) / 0.5);
}

.modal-content {
  position: fixed;
  z-index: 2;
  inset: 0;

  display: grid;
  place-content: center;
}
</style>

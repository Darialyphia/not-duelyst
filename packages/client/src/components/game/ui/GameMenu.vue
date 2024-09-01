<script setup lang="ts">
import { match } from 'ts-pattern';

const { dispatch, ui, gameType } = useGame();
const { isMenuOpened } = useGameUi();

useEventListener('keydown', e => {
  if (e.code !== 'Escape' || isMenuOpened.value) return;
  match(ui.targetingMode.value)
    .with('TARGETING', () => {
      ui.unselectCard();
    })
    .with('CARD_CHOICE', () => {
      ui.unselectCard();
      ui.cardChoice.value = null;
    })
    .otherwise(() => {
      isMenuOpened.value = true;
    });
});

const isSettingsOpened = ref(false);
</script>

<template>
  <UiFancyButton class="toggle" @click="isMenuOpened = true">
    <Icon name="material-symbols:settings" size="1.5rem" />
  </UiFancyButton>

  <UiModal
    v-model:is-opened="isMenuOpened"
    title="Menu"
    :style="{ '--ui-modal-size': 'var(--size-xs)' }"
  >
    <div class="menu">
      <UiButton is-fullwidth @click="isSettingsOpened = true">Settings</UiButton>
      <UiButton
        v-if="gameType === GAME_TYPES.PVP"
        is-fullwidth
        @click="
          () => {
            isMenuOpened = false;
            dispatch('surrender');
          }
        "
      >
        Surrender
      </UiButton>
      <NuxtLink v-else v-slot="{ navigate, href }" :to="{ name: 'ClientHome' }" custom>
        <UiButton is-fullwidth :href="href" @click="navigate">Exit game</UiButton>
      </NuxtLink>

      <DialogClose as-child>
        <UiButton is-fullwidth @click="isMenuOpened = false">Resume</UiButton>
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
.toggle {
  position: absolute;
  right: var(--size-4);
  bottom: var(--size-4);

  display: grid;
  place-content: center;

  aspect-ratio: 1;
  min-width: 0;
  padding: var(--size-3);

  font-size: var(--font-size-4);
}

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

<script setup lang="ts">
import { isDefined, type Nullable } from '@game/shared';

const { draggedIndex } = defineProps<{ draggedIndex: Nullable<number> }>();
const { gameType, ui, dispatch } = useGame();
const isActive = useIsActivePlayer();
const userPlayer = useUserPlayer();
const { isMobile } = useResponsive();
</script>

<template>
  <template v-if="gameType !== GAME_TYPES.SPECTATOR">
    <UiFancyButton
      v-if="isMobile"
      :style="{ '--hue': '230DEG', '--hue2': '210DEG' }"
      class="replace-button--mobile"
      :disabled="!isActive || !userPlayer.canReplace()"
      :class="{ dragging: isDefined(draggedIndex) }"
      @mouseup="
        () => {
          dispatch('replace', { cardIndex: ui.selectedCardIndex.value! });
          ui.unselectCard();
          ui.unselectEntity();
        }
      "
    >
      <Icon name="lucide:undo" />
    </UiFancyButton>

    <UiFancyButton
      v-else
      :style="{ '--hue': '230DEG', '--hue2': '210DEG' }"
      class="replace-button"
      :disabled="!isActive || !userPlayer.canReplace()"
      :class="{ dragging: isDefined(draggedIndex) }"
      @mouseup="
        () => {
          dispatch('replace', { cardIndex: ui.selectedCardIndex.value! });
          ui.unselectCard();
          ui.unselectEntity();
        }
      "
    >
      Replace ({{ userPlayer.maxReplaces - userPlayer.cardsReplacedThisTurn }} /
      {{ userPlayer.maxReplaces }})
    </UiFancyButton>
  </template>
</template>

<style scoped lang="postcss">
.replace-button {
  &:not(:disabled):hover {
    scale: 1.1;
    filter: drop-shadow(6px 6px 0 var(--cyan-5)) drop-shadow(-6px -6px 0 var(--orange-5));
  }
}

.replace-button--mobile {
  display: grid;
  place-content: center;

  aspect-ratio: 1;
  min-width: 0;
  padding: var(--size-3);

  font-size: var(--font-size-4);
}
</style>

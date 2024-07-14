<script setup lang="ts">
import { match } from 'ts-pattern';

const { ui, dispatch } = useGame();

const canSkip = computed(() => {
  const card = ui.selectedCard.value;
  if (!card) return false;

  return ui.cardTargets.value.length <= (card.blueprint.targets?.minTargetCount ?? 0);
});

const cancel = () => {
  match(ui.targetingMode.value)
    .with(TARGETING_MODES.TARGETING, () => {
      ui.unselectCard();
    })
    .otherwise(() => void 0);
};

const commitPlay = () => {
  dispatch('playCard', {
    cardIndex: ui.selectedCardIndex.value!,
    position: ui.summonTarget.value ?? { x: 0, y: 0, z: 0 },
    targets: ui.cardTargets.value,
    cardChoices: ui.cardChoiceIndexes.value
  });
  ui.unselectCard();
};

watchEffect(() => {
  match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.NONE,
      TARGETING_MODES.BASIC,
      TARGETING_MODES.SUMMON,
      TARGETING_MODES.CARD_CHOICE,
      () => undefined
    )
    .with(TARGETING_MODES.TARGETING, () => {
      const card = ui.selectedCard.value;
      if (!card) return false;
      if (ui.cardTargets.value.length === card.blueprint.targets?.maxTargetCount) {
        commitPlay();
      }
    })
    .exhaustive();
});
</script>

<template>
  <div
    v-if="
      ui.targetingMode.value === TARGETING_MODES.TARGETING &&
      ((ui.selectedCard.value?.blueprint.targets?.maxTargetCount ?? 0) > 1 ||
        ui.selectedCard.value?.blueprint.targets?.minTargetCount === 0)
    "
    class="targeting-ui"
  >
    <UiFancyButton :style="{ '--hue': '0DEG', '--hue2': '30DEG' }" @click="cancel">
      Cancel
    </UiFancyButton>
    <UiFancyButton
      v-if="canSkip"
      :style="{ '--hue': '230DEG', '--hue2': '210DEG' }"
      @click="commitPlay"
    >
      Skip
    </UiFancyButton>
  </div>
</template>

<style scoped lang="postcss">
.targeting-ui {
  position: absolute;
  bottom: calc(var(--size-12) + 3rem);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-6);
  align-items: center;
}
</style>

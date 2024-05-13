<script setup lang="ts">
import { match } from 'ts-pattern';

const { ui, dispatch } = useGame();

const canSkip = computed(() => {
  const card = ui.selectedCard.value;
  if (!card) return false;

  return (
    ui.followupTargets.value.length <= (card.blueprint.followup?.minTargetCount ?? 0)
  );
});

const cancel = () => {
  match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.NONE,
      TARGETING_MODES.BASIC,
      TARGETING_MODES.SUMMON,
      () => undefined
    )
    .with(TARGETING_MODES.FOLLOWUP, () => {
      ui.unselectCard();
    })
    .with(TARGETING_MODES.SKILL, () => {
      ui.unselectSkill();
    })
    .exhaustive();
};
const commitSummon = () => {
  dispatch('playCard', {
    cardIndex: ui.selectedCardIndex.value!,
    position: ui.summonTarget.value!,
    targets: ui.followupTargets.value
  });
  ui.unselectCard();
};

const commitSkill = () => {
  dispatch('useSkill', {
    skillIndex: ui.selectedSkillIndex.value!,
    entityId: ui.selectedEntity.value!.id,
    targets: ui.skillTargets.value
  });
  ui.unselectCard();
  ui.unselectSkill();
};

watchEffect(() => {
  match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.NONE,
      TARGETING_MODES.BASIC,
      TARGETING_MODES.SUMMON,
      () => undefined
    )
    .with(TARGETING_MODES.FOLLOWUP, () => {
      const card = ui.selectedCard.value;
      if (!card) return false;

      if (ui.followupTargets.value.length === card.blueprint.followup!.maxTargetCount) {
        commitSummon();
      }
    })
    .with(TARGETING_MODES.SKILL, () => {
      const skill = ui.selectedSkill.value;
      if (!skill) return false;
      if (ui.skillTargets.value.length === skill.maxTargetCount) {
        commitSkill();
      }
    })
    .exhaustive();
});
</script>

<template>
  <div
    v-if="
      ui.targetingMode.value === TARGETING_MODES.FOLLOWUP ||
      ui.targetingMode.value === TARGETING_MODES.SKILL
    "
    class="followup-ui"
  >
    <UiFancyButton :style="{ '--hue': '0DEG', '--hue2': '30DEG' }" @click="cancel">
      Cancel
    </UiFancyButton>
    <UiFancyButton
      v-if="canSkip"
      :style="{ '--hue': '230DEG', '--hue2': '210DEG' }"
      @click="commitSummon"
    >
      Skip
    </UiFancyButton>
  </div>
</template>

<style scoped lang="postcss">
.followup-ui {
  position: absolute;
  bottom: calc(var(--size-12) + 3rem);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-6);
  align-items: center;
}
</style>

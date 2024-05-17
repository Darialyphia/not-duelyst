<script setup lang="ts">
const { ui, dispatch } = useGame();
const isOpened = computed(() => {
  return ui.targetingMode.value === TARGETING_MODES.BLUEPRINT_FOLLOWUP;
});

const followup = computed(() => {
  if (ui.selectedSkill.value) {
    return ui.selectedSkill.value.blueprint.blueprintFollowup;
  } else if (ui.selectedCard.value) {
    return ui.selectedCard.value.blueprint.blueprintFollowup;
  } else return null;
});

const blueprints = computed(() => {
  return followup.value?.getChoices();
});

const canSkip = computed(() => {
  if (!followup.value) return false;

  return ui.followupBlueprintIndexes.value.length <= followup.value.minChoices;
});

const cancel = () => {
  if (ui.selectedSkill.value) {
    ui.unselectSkill();
  } else {
    ui.unselectCard();
  }
  ui.followupBlueprintIndexes.value = [];
};

watchEffect(() => {
  if (!followup.value) return;
  if (followup.value.maxChoices === ui.followupBlueprintIndexes.value.length) {
    if (ui.selectedSkill.value) {
      ui.switchTargetingMode(TARGETING_MODES.SKILL);
    } else if (ui.selectedCard.value) {
      if (ui.selectedCard.value.blueprint.followup) {
        ui.switchTargetingMode(TARGETING_MODES.FOLLOWUP);
      } else {
        dispatch('playCard', {
          cardIndex: ui.selectedCardIndex.value!,
          position: ui.summonTarget.value!,
          targets: [],
          blueprintFollowup: ui.followupBlueprintIndexes.value
        });
        ui.unselectCard();
      }
    }
  }
});
</script>

<template>
  <UiModal :closable="false" :isOpened="isOpened" title="Select a unit">
    <div class="flex gap-3" v-if="blueprints">
      <Card
        class="card"
        v-for="(blueprint, index) in blueprints"
        :key="index"
        :card="{
          blueprintId: blueprint.id,
          name: blueprint.name,
          description: blueprint.description,
          kind: blueprint.kind,
          spriteId: blueprint.spriteId,
          rarity: blueprint.rarity,
          attack: blueprint.attack,
          hp: blueprint.maxHp,
          speed: blueprint.speed,
          cost: blueprint.cost,
          cooldown: blueprint.cooldown,
          skills: blueprint.skills,
          pedestalId: 'pedestal-default',
          factions: blueprint.factions,
          tribes: blueprint.tribes ?? []
        }"
        @click="
          () => {
            const idx = ui.followupBlueprintIndexes.value.indexOf(index);
            if (idx >= 0) {
              ui.followupBlueprintIndexes.value.splice(idx, 1);
            } else {
              ui.followupBlueprintIndexes.value.push(index);
            }
          }
        "
      />
    </div>

    <footer class="mt-4 flex justify-center">
      <UiFancyButton :style="{ '--hue': '0DEG', '--hue2': '30DEG' }" @click="cancel">
        Cancel
      </UiFancyButton>
    </footer>
  </UiModal>
</template>

<style scoped lang="postcss">
.card {
  cursor: pointer;
  transition: filter 0.3s;
  &:hover {
    filter: drop-shadow(4px 4px 0 var(--cyan-5)) drop-shadow(-4px -4px 0 var(--orange-5));
  }
}
</style>

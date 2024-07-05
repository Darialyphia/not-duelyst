<script setup lang="ts">
const { ui, dispatch } = useGame();
const isOpened = computed(() => {
  return ui.targetingMode.value === TARGETING_MODES.BLUEPRINT_FOLLOWUP;
});

const followup = computed(() => {
  if (ui.selectedCard.value) {
    return ui.selectedCard.value.blueprint.blueprintFollowup;
  } else return null;
});

const blueprints = computed(() => {
  return followup.value?.getChoices();
});

const cancel = () => {
  ui.unselectCard();
  ui.followupBlueprintIndexes.value = [];
};

watchEffect(() => {
  if (!followup.value) return;
  if (!ui.selectedCard.value) return;
  if (followup.value.maxChoices === ui.followupBlueprintIndexes.value.length) {
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
});
</script>

<template>
  <UiModal
    :closable="false"
    :is-opened="isOpened"
    title="Select a unit"
    :style="{ '--ui-modal-size': 'var(--size-xl)' }"
  >
    <div v-if="blueprints" class="flex justify-between">
      <Card
        v-for="(blueprint, index) in blueprints"
        :key="index"
        class="card"
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
          pedestalId: 'pedestal-default',
          faction: blueprint.faction,
          tags: blueprint.tags ?? []
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

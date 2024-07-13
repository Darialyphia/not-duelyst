<script setup lang="ts">
const { ui, dispatch } = useGame();
const isOpened = computed(() => {
  return ui.targetingMode.value === TARGETING_MODES.CARD_CHOICE;
});

const cardChoices = computed(() => {
  if (ui.selectedCard.value) {
    return ui.selectedCard.value.blueprint.cardChoices;
  } else return null;
});

const blueprints = computed(() => {
  return cardChoices.value?.getChoices();
});

const cancel = () => {
  ui.unselectCard();
  ui.cardChoiceIndexes.value = [];
};

watchEffect(() => {
  if (!ui.selectedCard.value) return;
  if (!cardChoices.value) return;
  if (cardChoices.value.maxChoices === ui.cardChoiceIndexes.value.length) {
    if (ui.selectedCard.value.blueprint.targets) {
      ui.switchTargetingMode(TARGETING_MODES.TARGETING);
    } else {
      dispatch('playCard', {
        cardIndex: ui.selectedCardIndex.value!,
        position: ui.summonTarget.value ?? { x: 0, y: 0, z: 0 },
        targets: [],
        cardChoices: ui.cardChoiceIndexes.value
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
            const idx = ui.cardChoiceIndexes.value.indexOf(index);
            if (idx >= 0) {
              ui.cardChoiceIndexes.value.splice(idx, 1);
            } else {
              ui.cardChoiceIndexes.value.push(index);
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

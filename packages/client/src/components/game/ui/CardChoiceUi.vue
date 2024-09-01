<script setup lang="ts">
import type { CardBlueprintId } from '@game/sdk/src/card/card';
import type { Point3D } from '@game/shared';

const { ui, dispatch, session } = useGame();
const isOpened = computed(() => {
  return ui.targetingMode.value === TARGETING_MODES.CARD_CHOICE;
});

type Cardchoice = {
  type: 'card';
  blueprintId: CardBlueprintId;
  description: string;
  onPlay: (options: { position: Point3D; targets: Point3D[] }) => Promise<void>;
};

const cardChoices = computed(() => {
  if (ui.selectedCard.value) {
    return ui.selectedCard.value.meta.adapt as Cardchoice[] | undefined;
  } else return null;
});

const blueprints = computed(() => {
  if (!cardChoices.value) return [];
  return cardChoices.value.map(choice => {
    const blueprint = session.cardBlueprints[choice.blueprintId];
    return {
      ...blueprint,
      description: choice.description
    };
  });
});

const cancel = () => {
  ui.unselectCard();
  ui.cardChoice.value = null;
};
</script>

<template>
  <UiModal :closable="false" :is-opened="isOpened" title="Choose one">
    <div v-if="blueprints" class="cards" :style="{ '--cols': cardChoices?.length }">
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
            ui.cardChoice.value = index;
            if (!ui.selectedCard.value) return;
            if (ui.selectedCard.value.targets) {
              ui.switchTargetingMode(TARGETING_MODES.TARGETING);
            } else {
              dispatch('playCard', {
                cardIndex: ui.selectedCardIndex.value!,
                position: ui.summonTarget.value ?? { x: 0, y: 0, z: 0 },
                targets: [],
                choice: ui.cardChoice.value ?? 0
              });
              ui.unselectCard();
            }
          }
        "
      />
    </div>

    <footer class="mt-4 flex justify-center">
      <UiButton class="error-button" @click="cancel">Cancel</UiButton>
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

.cards {
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
}
</style>

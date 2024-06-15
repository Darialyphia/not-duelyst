<script setup lang="ts">
import type { PlayerId } from '@game/sdk';
import { isDefined } from '@game/shared';

const { index, playerId } = defineProps<{ index: number; playerId: PlayerId }>();
const { ui, currentTutorialStep } = useGame();

const card = useGameSelector(
  session => session.playerSystem.getPlayerById(playerId)!.hand[index]
);

const userPlayer = useUserPlayer();
</script>

<template>
  <Sound sound="button-hover" :triggers="['mouseenter']">
    <Sound sound="button-click" :triggers="['mousedown']">
      <Card
        v-if="card"
        class="card"
        :class="{
          disabled:
            !userPlayer.canPlayCardAtIndex(index) ||
            (isDefined(currentTutorialStep?.highlightedCardIndex) &&
              currentTutorialStep.highlightedCardIndex !== index)
        }"
        :card="{
          blueprintId: card.blueprintId,
          name: card.blueprint.name,
          description: card.blueprint.description,
          kind: card.kind,
          spriteId: card.blueprint.spriteId,
          rarity: card.blueprint.rarity,
          attack: card.blueprint.attack,
          hp: card.blueprint.maxHp,
          speed: card.blueprint.speed,
          cost: card.cost,
          skills: card.blueprint.skills,
          pedestalId: card.pedestalId,
          factions: card.blueprint.factions,
          tribes: card.blueprint.tribes ?? []
        }"
        @contextmenu.prevent="ui.highlightedCard.value = card"
        @click="
          () => {
            if (userPlayer.canPlayCardAtIndex(index)) {
              ui.selectCardAtIndex(index);
            }
          }
        "
      />
    </Sound>
  </Sound>
</template>

<style scoped lang="postcss">
.card {
  position: relative;

  &.disabled {
    filter: grayscale(70%) brightness(70%) contrast(100%);
  }
}
</style>

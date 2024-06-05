<script setup lang="ts">
import type { PlayerId } from '@game/sdk';

const { index, playerId } = defineProps<{ index: number; playerId: PlayerId }>();
const { ui } = useGame();

const card = useGameSelector(
  session => session.playerSystem.getPlayerById(playerId)!.hand[index]
);

const player = useUserPlayer();
const hoveredIndex = ref<number | null>(null);
</script>

<template>
  <UiTooltip :side-offset="30" :delay="100">
    <template #trigger>
      <Sound sound="button-hover" :triggers="['mouseenter']">
        <Sound sound="button-click" :triggers="['mousedown']">
          <button
            class="card-button"
            :class="[
              card && card?.blueprint.kind.toLowerCase(),
              {
                selected: card && ui.selectedCard.value === card,
                'cost-debuf': card && card.cost > card.blueprint.cost,
                'cost-buff': card && card.cost < card.blueprint.cost
              }
            ]"
            :disabled="!card || !player.canPlayCardAtIndex(index)"
            :data-cost="card && card.cost"
            @contextmenu.prevent="ui.highlightedCard.value = card"
            @click="ui.selectCardAtIndex(index)"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          >
            <AnimatedCardIcon
              v-if="card"
              :sprite-id="card.blueprint.spriteId"
              class="icon"
            />
          </button>
        </Sound>
      </Sound>
    </template>

    <Card
      v-if="card"
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
    />
  </UiTooltip>
</template>

<style scoped lang="postcss">
.card-button {
  position: relative;

  box-sizing: content-box;
  padding: 0;

  background: transparent;
  border: none;

  transition: transform 0.2s;

  &:not(:empty)::after {
    background: radial-gradient(circle at center, black 20%, transparent 80%);
  }

  &:disabled,
  &.disabled {
    filter: grayscale(1);
  }

  &[data-cost] {
    &::before {
      content: attr(data-cost);

      position: absolute;
      z-index: 2;
      right: -5px;
      bottom: -10px;

      display: grid;
      place-content: center;

      aspect-ratio: 1;
      width: 3ch;

      line-height: 1;

      background: linear-gradient(to bottom, var(--blue-7), var(--blue-9));
      border: solid var(--border-size-1) currentColor;
      border-radius: var(--radius-round);
      box-shadow: 0 3px 5px 1px hsl(0 0 0 / 0.3);
    }
    &.cost-buff::before {
      background: linear-gradient(to bottom, var(--green-7), var(--green-9));
    }
    &.cost-debuff::before {
      background: linear-gradient(to bottom, var(--red-9), var(--red-11));
    }
  }

  > .icon {
    z-index: 1;
    bottom: 0;
    left: 0;
    transform-origin: bottom center;

    transition:
      transform 0.3s ease-out,
      filter 0.3s;
  }

  &.card-button.selected > .icon,
  &.spell > .icon {
    bottom: 10px;
    left: 26px;
    filter: drop-shadow(0 0 1px black);
  }
  &.selected {
    &::after {
      border-color: var(--blue-2);
    }

    > .icon {
      transform: translateY(-15px);
    }
  }
}
</style>

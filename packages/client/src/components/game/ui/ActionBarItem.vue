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
        :style="{
          '--cooldown-angle': 360 - (360 * card.currentCooldown) / card.cooldown
        }"
        :disabled="!card || !player.canPlayCardAtIndex(index)"
        :data-cost="card && card.cost"
        :data-remaining-cooldown="
          card && card.currentCooldown > 0 ? card.currentCooldown : undefined
        "
        @click="ui.selectCardAtIndex(index)"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        <AnimatedCardIcon v-if="card" :sprite-id="card.blueprint.spriteId" class="icon" />
      </button>
    </template>

    <Card
      v-if="card"
      :card="{
        name: card.blueprint.name,
        description: card.blueprint.description,
        kind: card.kind,
        spriteId: card.blueprint.spriteId,
        rarity: card.blueprint.rarity,
        attack: card.blueprint.attack,
        hp: card.blueprint.maxHp,
        speed: card.blueprint.speed,
        cost: card.cost,
        cooldown: card.cooldown,
        skills: card.blueprint.skills,
        pedestalId: card.pedestalId,
        factions: card.blueprint.factions
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

    &[data-remaining-cooldown] {
      &::after {
        content: attr(data-remaining-cooldown);

        position: absolute;
        top: 0;
        left: 0;

        display: grid;
        place-content: center;

        width: 100%;
        height: 100%;

        font-size: var(--font-size-5);
        font-weight: var(--font-weight-7);
        color: white;
        text-shadow: 0 3px 2px black;

        background: conic-gradient(
          hsl(var(--gray-11-hsl) / 0.1) calc(1deg * var(--cooldown-angle)),
          hsl(var(--gray-11-hsl) / 0.5) calc(1deg * var(--cooldown-angle))
        );
        backdrop-filter: blur(2px);
        border: none;
        border-radius: 50%;
      }
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

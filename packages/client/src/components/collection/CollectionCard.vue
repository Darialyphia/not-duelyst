<script setup lang="ts">
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import { KEYWORDS, type CardBlueprint } from '@game/sdk';
import { uniqBy } from 'lodash-es';

defineOptions({
  inheritAttrs: false
});

const { canAddToLoadout, isEditingLoadout, card, isInLoadout } = defineProps<{
  canAddToLoadout: boolean;
  isInLoadout: boolean;
  isEditingLoadout: boolean;
  card: { card: CardBlueprint; _id: Id<'collectionItems'>; cardId: string };
}>();

const emit = defineEmits<{ click: [] }>();
const rootEl = ref<HTMLElement>();

const angle = ref({
  x: 0,
  y: 0
});

const isDisabled = computed(() => isEditingLoadout && !canAddToLoadout);
const MAX_ANGLE = 20;
const onMousemove = (e: MouseEvent) => {
  if (isDisabled.value) return;
  if (!rootEl.value) return;

  const { clientX, clientY } = e;
  const { left, top, width, height } = unrefElement(
    rootEl.value
  )!.getBoundingClientRect();
  angle.value = {
    x: ((clientX - left) / width - 0.5) * MAX_ANGLE,
    y: ((clientY - top) / height - 0.5) * MAX_ANGLE
  };
};

const keywords = computed(() => {
  console.log(KEYWORDS);
  return uniqBy(
    [
      ...(card.card.keywords ?? []),
      ...card.card.skills.map(skill => skill.keywords ?? []).flat()
    ],
    'id'
  );
});
</script>

<template>
  <div class="perspective-wrapper">
    <Card
      has-modal
      ref="rootEl"
      :tabindex="isEditingLoadout && !canAddToLoadout ? -1 : 0"
      class="collection-card"
      :class="{
        used: isEditingLoadout && isInLoadout,
        disabled: isDisabled
      }"
      :style="{
        '--rotate-y': angle.x.toFixed(2),
        '--rotate-x': angle.y.toFixed(2)
      }"
      :card="{
        blueprintId: card.card.id,
        name: card.card.name,
        description: card.card.description,
        kind: card.card.kind,
        spriteId: card.card.spriteId,
        rarity: card.card.rarity,
        attack: card.card.attack,
        hp: card.card.maxHp,
        speed: card.card.speed,
        cost: card.card.cost,
        cooldown: card.card.cooldown,
        skills: card.card.skills,
        factions: card.card.factions,
        keywords: keywords
      }"
      @mousemove="onMousemove"
      @click="emit('click')"
      @keyup.enter="emit('click')"
    />
  </div>
</template>

<style scoped lang="postcss">
@keyframes collection-card {
  from {
    transform: translateX(calc(-1 * var(--size-4)));
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}
.perspective-wrapper {
  transform-style: preserve-3d;
  padding: var(--size-1);
  perspective: 40rem;
  animation: collection-card 0.3s;

  > * {
    height: 100%;
  }
}
.collection-card {
  position: relative;
  display: grid;
  transition: filter 0.3s;

  > * {
    grid-column: 1;
    grid-row: 1;
  }

  &:focus-visible {
    outline: solid var(--border-size-3) var(--primary);
  }

  &.used {
    filter: drop-shadow(4px 4px 0 var(--cyan-5)) drop-shadow(-4px -4px 0 var(--orange-5));
  }

  &.disabled {
    opacity: 0.8;
    filter: grayscale(0.5);
  }

  &:not(.disabled):hover {
    transform: rotateY(calc(1deg * var(--rotate-y))) rotateX(calc(1deg * var(--rotate-x)));
  }
  &:not(:hover) {
    transition: transform 0.3s;
  }
}
</style>

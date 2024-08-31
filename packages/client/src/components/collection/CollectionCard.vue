<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import { type CardBlueprint } from '@game/sdk';
import { uniqBy } from 'lodash-es';

defineOptions({
  inheritAttrs: false
});

const {
  canAddToLoadout,
  animated = true,
  isEditingLoadout,
  card
} = defineProps<{
  canAddToLoadout: boolean;
  isEditingLoadout: boolean;
  card: {
    card: CardBlueprint;
    _id: Id<'collectionItems'>;
    cardId: string;
    pedestalId: string;
    cardBackId: string;
  };
  animated?: boolean;
}>();

const emit = defineEmits<{ click: [] }>();

const { settings } = useUserSettings();

const cardEl = ref<HTMLElement>();
const angle = ref({
  x: 0,
  y: 0
});

const isDisabled = computed(() => isEditingLoadout && !canAddToLoadout);
const MAX_ANGLE = 20;
const onMousemove = (e: MouseEvent) => {
  if (!animated) return;

  if (isDisabled.value) return;
  if (!cardEl.value) return;

  const { clientX, clientY } = e;
  const { left, top, width, height } = unrefElement(
    cardEl.value
  )!.getBoundingClientRect();
  angle.value = {
    x: ((clientX - left) / width - 0.5) * MAX_ANGLE,
    y: ((clientY - top) / height - 0.5) * MAX_ANGLE
  };
};

const wrapperEl = ref<HTMLElement>();
const isHovered = useElementHover(wrapperEl);

const isCosmeticsModalOpened = ref(false);

const { isLoading, mutate: updateCosmetics } = useConvexAuthedMutation(
  api.collection.updateCollectionItem,
  {
    onSuccess() {
      isCosmeticsModalOpened.value = false;
    }
  }
);

const { isMobile } = useResponsive();
</script>

<template>
  <div
    ref="wrapperEl"
    class="perspective-wrapper"
    :class="[settings.ui.cardsWith3D && '3d']"
  >
    <Sound sound="button-hover.m4a" :triggers="['mouseenter']">
      <Card
        ref="cardEl"
        has-modal
        :tabindex="isEditingLoadout && !canAddToLoadout ? -1 : 0"
        class="collection-card"
        :class="{
          disabled: isDisabled
        }"
        :style="{
          '--rotate-y': settings.ui.cardsWith3D ? angle.x.toFixed(2) : 0,
          '--rotate-x': settings.ui.cardsWith3D ? angle.y.toFixed(2) : 0
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
          faction: card.card.faction,
          tags: card.card.tags ?? [],
          cardbackId: card.cardBackId,
          pedestalId: card.pedestalId
        }"
        @mousemove="onMousemove"
        @click="emit('click')"
        @keyup.enter="emit('click')"
      />
    </Sound>

    <Transition>
      <UiIconButton
        v-if="isMobile ? true : isHovered"
        class="ghost-button cosmetics-toggle"
        name="mdi:palette"
        @click="isCosmeticsModalOpened = true"
      />
    </Transition>
    <CollectionItemCosmeticsModal
      v-model:is-opened="isCosmeticsModalOpened"
      :card="card"
      :is-loading="isLoading"
      @submit="
        updateCosmetics({
          id: card._id,
          ...$event
        })
      "
    />
  </div>
</template>

<style scoped lang="postcss">
.perspective-wrapper {
  position: relative;
  transform-style: preserve-3d;
  align-self: start;
  transition: filter 0.3s;
  &:hover {
    filter: drop-shadow(4px 4px 0 var(--cyan-5)) drop-shadow(-4px -4px 0 var(--orange-5));
  }
  &.3d {
    perspective: 40rem;
  }
}
.collection-card {
  position: relative;
  filter: none;

  &:focus-visible {
    outline: solid var(--border-size-3) var(--primary);
  }

  &.disabled {
    filter: grayscale(40%) brightness(90%);
  }

  &:not(.disabled):hover {
    transform: rotateY(calc(1deg * var(--rotate-y))) rotateX(calc(1deg * var(--rotate-x)));
  }

  &:not(:hover) {
    transition:
      transform 0.3s,
      filter 0.3s;
  }
}

.cosmetics-toggle {
  --ui-icon-button-size: var(--size-7);

  position: absolute;
  right: 0;
  bottom: calc(-1 * var(--size-3));

  @screen lt-lg {
    right: 40%;
    bottom: 0;
  }
  &:is(.v-enter-active, .v-leave-active) {
    transition: opacity 0.2s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
}
</style>

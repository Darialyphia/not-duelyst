<script setup lang="ts">
import { CARDS } from '@game/sdk';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';
import { clamp } from '@game/shared';
import { uniqBy } from 'lodash-es';

const { blueprintId, disableRightClick = false } = defineProps<{
  blueprintId: string;
  disableRightClick?: boolean;
}>();
const isOpened = defineModel<boolean>('isOpened', { required: true });

const blueprint = computed(() => CARDS[blueprintId]);

const { settings } = useUserSettings();
const selectedBlueprint = computed(() =>
  parseSerializeBlueprint(CARDS[selectedBlueprintId.value])
);

const relatedBlueprints = computed(() =>
  (blueprint.value.relatedBlueprintIds ?? []).map(id => CARDS[id])
);

const blueprints = computed(() => {
  return [...new Set([blueprint.value, ...relatedBlueprints.value])]
    .map(bp => parseSerializeBlueprint(bp))
    .concat([selectedBlueprint.value]);
});

const keywords = computed(() => uniqBy(selectedBlueprint.value.keywords ?? [], 'id'));

const selectedBlueprintId = ref(blueprintId);
const MAX_ANGLE = 30;
const MAX_OFFSET = 150;
const angle = computed(() => {
  return (
    clamp(relatedBlueprints.value.length * 10, 0, MAX_ANGLE) /
    Math.max(relatedBlueprints.value.length, 1)
  );
});
const offset = computed(() => {
  return (
    clamp(relatedBlueprints.value.length * 50, 0, MAX_OFFSET) /
    Math.max(relatedBlueprints.value.length, 1)
  );
});
</script>

<template>
  <UiModal v-model:is-opened="isOpened" :style="{ '--ui-modal-size': 'var(--size-md)' }">
    <div
      class="card-modal fancy-scrollbar"
      :style="{ '--column-gap': relatedBlueprints.length }"
      @contextmenu="
        e => {
          if (disableRightClick) {
            e.preventDefault();
          }
        }
      "
    >
      <div class="cards-wrapper" :style="{ '--angle': angle, '--offset': offset }">
        <div
          v-for="(bp, index) in blueprints"
          :key="bp.id"
          :style="{ '--index': index }"
          :class="index === 0 && settings.ui.cardsWith3D && 'card-3d'"
          @click="selectedBlueprintId = bp.id"
        >
          <Card
            :card="{
              blueprintId: bp.id,
              name: bp.name,
              description: bp.description,
              kind: bp.kind,
              spriteId: bp.spriteId,
              rarity: bp.rarity,
              attack: bp.attack,
              hp: bp.maxHp,
              speed: bp.speed,
              cost: bp.cost,
              faction: bp.faction,
              tags: bp.tags ?? []
            }"
          />
        </div>
      </div>

      <section class="fancy-scrollbar">
        <DialogTitle class="pb-5">
          {{ selectedBlueprint.name }}
        </DialogTitle>

        <p class="text-3">
          <TextWithKeywords :text="selectedBlueprint.description" />
        </p>

        <dl class="mt-5">
          <dt>Rarity</dt>
          <dd class="capitalize">{{ selectedBlueprint.rarity }}</dd>
          <dt>Faction</dt>
          <dd>{{ selectedBlueprint.faction?.name ?? 'Neutral' }}</dd>
        </dl>

        <dl v-if="keywords.length" class="keywords">
          <div v-for="keyword in keywords" :key="keyword.id">
            <dt>{{ keyword.name }}</dt>
            <dd>{{ keyword.description }}</dd>
          </div>
        </dl>
      </section>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
@keyframes card-3d {
  from {
    transform: rotateY(0);
  }
  25% {
    transform: rotateY(20deg) rotateX(-5deg);
  }
  50% {
    transform: rotateY(0);
  }
  75% {
    transform: rotateY(-20deg) rotateX(5deg);
  }
  to {
    transform: rotateY(0);
  }
}

@keyframes card-modal-brightness {
  from {
    filter: brightness(1000%) contrast(300%);
  }
  to {
    filter: brightness(100%) contrast(100%);
  }
}
.card-modal {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: calc(var(--size-8) + var(--column-gap) * var(--size-5));

  height: clamp(50dvh, 30rem, 80dvh);
  padding: var(--size-4);

  perspective: 80rem;
}

.cards-wrapper {
  position: sticky;
  top: 0;
  transform-style: preserve-3d;

  display: grid;
  align-self: start;
  justify-self: center;

  animation: card-modal-brightness, card-3d;
  animation-duration: 0.6s, 8s;
  animation-timing-function: ease-out, linear;
  animation-delay: 0.3s, 0;
  animation-iteration-count: 1, infinite;

  > div {
    cursor: pointer;

    position: relative;
    z-index: calc(10 - var(--index));
    transform: translateX(calc(var(--index) * var(--offset) * 1px))
      rotateZ(calc(var(--index) * var(--angle) * 1deg));

    grid-column: 1;
    grid-row: 1;

    width: fit-content;

    transition: filter 0.3s;
    &:hover {
      filter: drop-shadow(4px 4px 0 var(--cyan-5))
        drop-shadow(-4px -4px 0 var(--orange-5));
    }
  }
  .card-3d {
    transform-style: preserve-3d;
  }
}

h3 {
  margin-block-end: var(--size-2);
}

h4 {
  line-height: 1;
}

.keywords {
  display: grid;
  gap: var(--size-2);

  margin-top: var(--size-5);
  padding-top: var(--size-5);

  border-top: solid var(--border-size-1) var(--border);
}

dt {
  margin-top: 0 !important;
}

ul {
  margin-block-end: var(--size-4);
}
li {
  min-height: 76px;
  padding-left: 82px;

  background: var(--bg);
  background-repeat: no-repeat;
  background-size: 76px 76px;

  image-rendering: pixelated;
  &.selected {
    filter: contrast(130%) brightness(110%);
    outline: var(--fancy-border);
    outline-offset: 4px;
  }
}
section {
  overflow: auto;
  height: 100%;
}
</style>

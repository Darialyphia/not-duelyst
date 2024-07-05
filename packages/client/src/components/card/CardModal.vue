<script setup lang="ts">
import { CARDS } from '@game/sdk';
import { clamp } from '@game/shared';
import { uniqBy } from 'lodash-es';

const { blueprintId, disableRightClick = false } = defineProps<{
  blueprintId: string;
  disableRightClick?: boolean;
}>();
const isOpened = defineModel<boolean>('isOpened', { required: true });

const blueprint = computed(() => CARDS[blueprintId]);

const { settings } = useUserSettings();
const selectedBlueprint = computed(() => CARDS[selectedBlueprintId.value]);

const relatedBlueprints = computed(() =>
  (blueprint.value.relatedBlueprintIds ?? []).map(id => CARDS[id])
);

const blueprints = computed(() => {
  const res = [
    ...new Set([selectedBlueprint.value, blueprint.value, ...relatedBlueprints.value])
  ];
  return res;
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
  <UiModal
    v-model:is-opened="isOpened"
    :title="selectedBlueprint.name"
    :style="{ '--ui-modal-size': 'var(--size-lg)' }"
  >
    <template #title="{ title }">
      <div class="pl-8">{{ title }}</div>
    </template>
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
              tribes: bp.tribes ?? []
            }"
          />
        </div>
      </div>

      <section class="fancy-scrollbar">
        <p>
          <TextWithKeywords :text="selectedBlueprint.description" />
        </p>

        <h3 v-if="keywords.length">Keywords</h3>
        <dl>
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
  grid-template-columns: 1fr 1fr;
  column-gap: calc(var(--size-11) + var(--column-gap) * var(--size-5));

  width: calc(var(--size-md) + 5rem);
  height: clamp(50dvh, 30rem, 80dvh);
  padding-top: var(--size-5);

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

dl {
  display: grid;
  gap: var(--size-2);
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
  padding-right: var(--size-5);
}
</style>

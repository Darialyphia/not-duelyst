<script setup lang="ts">
import { CARDS } from '@game/sdk';
import { clamp } from '@game/shared';
import { uniqBy } from 'lodash-es';

const { blueprintId } = defineProps<{ blueprintId: string }>();
const isOpened = defineModel<boolean>('isOpened', { required: true });

const blueprint = computed(() => CARDS[blueprintId]);

const settings = useUserSettings();
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

const keywords = computed(() =>
  uniqBy(
    [
      ...(selectedBlueprint.value.keywords ?? []),
      ...selectedBlueprint.value.skills.map(skill => skill.keywords ?? []).flat()
    ],
    'id'
  )
);

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
  <UiModal v-model:is-opened="isOpened" :title="selectedBlueprint.name">
    <template #title="{ title }">
      <div class="pl-8">{{ title }}</div>
    </template>
    <div class="card-modal fancy-scrollbar">
      <div class="cards-wrapper" :style="{ '--angle': angle, '--offset': offset }">
        <div
          v-for="(blueprint, index) in blueprints"
          :key="blueprint.id"
          :style="{ '--index': index }"
          :class="settings.ui.cardsWith3D && 'card-3d'"
          @click="selectedBlueprintId = blueprint.id"
        >
          <Card
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
              cooldown: blueprint.cooldown,
              skills: blueprint.skills,
              factions: blueprint.factions,
              tribes: blueprint.tribes ?? []
            }"
            :with-skills="false"
          />
        </div>
      </div>

      <section class="fancy-scrollbar">
        <p>
          <TextWithKeywords :text="selectedBlueprint.description" />
        </p>
        <h3 v-if="selectedBlueprint.skills.length">Abilities</h3>

        <ul>
          <li
            v-for="skill in selectedBlueprint.skills"
            :key="skill.id"
            :style="{
              '--bg': `url('/assets/icons/${skill.iconId}.png')`
            }"
          >
            <h4>{{ skill.name }}</h4>
            <p class="whitespace-pre-line">
              <TextWithKeywords :text="skill.description" />
            </p>
            <p class="text-right">
              <Icon name="icon-park-outline:hourglass-full" />
              Cooldown: {{ skill.cooldown }}
            </p>
            <p class="text-right" v-if="skill.initialCooldown">
              <Icon name="typcn:stopwatch" />
              Initial cooldown: {{ skill.initialCooldown }}
            </p>
          </li>
        </ul>
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
@keyframes card-modal {
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
  column-gap: var(--size-13);

  width: calc(var(--size-md) + 5rem);
  height: clamp(50dvh, 30rem, 80dvh);
  padding-top: var(--size-5);
}

.cards-wrapper {
  position: sticky;
  top: 0;
  transform-style: preserve-3d;

  display: grid;
  align-self: start;
  justify-self: center;

  perspective: 40rem;

  animation: card-modal-brightness;
  animation-duration: 0.6s;
  animation-timing-function: ease-out;
  animation-delay: 0.3s;

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

    animation-name: card-modal;
    animation-duration: 8s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
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

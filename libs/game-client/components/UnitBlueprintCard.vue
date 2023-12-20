<script setup lang="ts">
import type { UnitBlueprint } from '@hc/sdk';
import { unitImagesPaths } from '../assets/units';
import { skillImagesPaths } from '../assets/skills';

import havenBorder from '../assets/ui/icon-border-haven.png';
import chaosBorder from '../assets/ui/icon-border-chaos.png';
import { exhaustiveSwitch } from '../../shared/src';

const { unit } = defineProps<{
  unit: UnitBlueprint;
}>();

const border = computed(() => {
  switch (unit.faction.id) {
    case 'haven':
      return havenBorder;
    case 'chaos':
      return chaosBorder;
    default:
      throw exhaustiveSwitch;
  }
});
</script>

<template>
  <article class="entity-card content-surface fancy-surface">
    <div class="avatar-container fancy-surface mx-auto">
      <img :src="unitImagesPaths[unit.spriteId]" />
    </div>
    <div class="text-center">{{ unit.id }}</div>

    <div class="stats">
      <div>
        <div class="i-game-icons:health-normal" style="--color: var(--hp)" />
        {{ unit.maxHp }}
      </div>

      <div>
        <div class="i-game-icons-drop" style="--color: var(--ap)" />
        {{ unit.maxAp }}
      </div>

      <div>
        <div class="i-game-icons-broadsword" style="--color: var(--attack)" />
        <span>
          {{ unit.attack }}
        </span>
      </div>

      <div>
        <div class="i-game-icons-rosa-shield" style="--color: var(--defense)" />
        <span>
          {{ unit.defense }}
        </span>
      </div>

      <div>
        <div class="i-ri-hourglass-fill" />
        <span>
          {{ unit.initiative }}
        </span>
      </div>
    </div>

    <div v-for="skill in unit.skills" :key="skill.id" class="skill">
      <div
        class="skill-img"
        :data-cost="skill.cost"
        :style="{
          '--bg': `url(${skillImagesPaths[skill.id]})`,
          '--border': `url(${border})`
        }"
      />

      <div>{{ skill.id }}</div>
      <!-- <p>{{ skill.description }}</p> -->
    </div>
  </article>
</template>

<style scoped lang="postcss">
.entity-card {
  --hp: var(--green-5);
  --ap: var(--indigo-8);
  --attack: var(--red-7);
  --defense: var(--cyan-5);

  width: 18rem;
  padding: 0 var(--size-6) var(--size-6);
  font-size: var(--font-size-2);
  backdrop-filter: blur(5px);
}

.avatar-container {
  transform: translateY(-25%);

  overflow: hidden;

  aspect-ratio: 1;
  width: var(--size-11);
  padding: var(--size-1);

  border-radius: var(--radius-round);

  > img {
    transform: scale(3);

    display: block;

    width: 100%;
    height: 100%;

    object-fit: cover;
    object-position: 0 0;

    image-rendering: pixelated;
  }

  & + * {
    margin-top: calc(-1 * var(--size-3));
  }
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: var(--size-1);
  column-gap: var(--size-3);

  > * {
    display: flex;
    gap: var(--size-1);
    align-items: center;

    > * {
      color: var(--color, inherit);
    }
  }
}

.skill {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  row-gap: var(--size-1);
  column-gap: var(--size-3);

  margin-top: var(--size-2);
  margin-bottom: var(--size-4);

  font-size: var(--font-size-1);
  line-height: 1;

  .skill-img {
    aspect-ratio: 1;
    width: 32px;
    background-image: var(--border), var(--bg);
    background-size: contain;
  }

  p {
    grid-column: 2;
    font-size: var(--font-size-00);
    opacity: 0.8;
  }

  [data-cost] {
    position: relative;
    &::after {
      content: attr(data-cost);

      position: absolute;
      right: 0;
      bottom: 0;
      transform: translate(50%, 50%);

      display: grid;
      place-content: center;

      aspect-ratio: 1;
      width: 3ch;

      font-size: var(--font-size-00);

      background: var(--fancy-bg);
      background-blend-mode: overlay;
      border: var(--fancy-border);
      border-radius: var(--radius-round);
    }
  }
}

ul > li {
  display: flex;
  gap: var(--size-2);
  align-items: center;

  margin-top: var(--size-2);
  margin-bottom: var(--size-2);

  font-size: var(--font-size-0);
  line-height: 1;
}
</style>

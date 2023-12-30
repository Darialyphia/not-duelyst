<script setup lang="ts">
import type { UnitBlueprint } from '@hc/sdk';
import { unitImagesPaths } from '../assets/units';
import { skillImagesPaths } from '../assets/skills';

import neutralBorder from '../assets/ui/icon-border-neutral.png';
import havenBorder from '../assets/ui/icon-border-haven.png';
import chaosBorder from '../assets/ui/icon-border-chaos.png';
import { exhaustiveSwitch } from '../../shared/src';

const { unit } = defineProps<{
  unit: UnitBlueprint;
}>();

const border = computed(() => {
  switch (unit.faction.id) {
    case 'neutral':
      return neutralBorder;
    case 'haven':
      return havenBorder;
    case 'chaos':
      return chaosBorder;
    default:
      throw exhaustiveSwitch(unit.faction.id);
  }
});
</script>

<template>
  <article class="entity-card content-surface fancy-surface">
    <div class="flex justify-between">
      <div class="avatar-container fancy-surface">
        <img :src="unitImagesPaths[unit.spriteId]" />
      </div>

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
          <div class="i-mdi:run-fast" style="--color: var(--speed)" />
          <span>
            {{ unit.speed }}
          </span>
        </div>
      </div>
    </div>
    <div class="text-center text-4 font-600 my-3">{{ unit.id }}</div>

    <p v-if="unit.onSummoned?.getDescription">
      On summoned: {{ unit.onSummoned.getDescription(unit) }}
    </p>

    <p v-for="(trigger, index) in unit.effects" :key="index">
      {{ trigger.description }}
    </p>

    <ul class="skills-list fancy-scrollbar">
      <li v-for="skill in unit.skills" :key="skill.id" class="skill">
        <div
          class="skill-img"
          :data-cost="skill.cost"
          :style="{
            '--bg': `url(${skillImagesPaths[skill.spriteId]})`,
            '--border': `url(${border})`
          }"
        />

        <div class="grid gap-1">
          {{ skill.name }}
          <p>{{ skill.getText(unit) }}</p>
          <p class="text-0">Cooldown: {{ skill.cooldown }}</p>
        </div>
      </li>
    </ul>
  </article>
</template>

<style scoped lang="postcss">
.entity-card {
  --hp: var(--green-5);
  --ap: var(--indigo-8);
  --attack: var(--red-7);
  --defense: var(--cyan-5);
  --speed: var(--yellow-3);

  display: grid;
  grid-template-rows: auto auto auto;

  width: 18rem;
  padding: var(--size-3) var(--size-6) var(--size-6);

  font-size: var(--font-size-2);
  color: white;

  backdrop-filter: blur(5px);

  > p {
    margin-block: var(--size-1);
    font-size: var(--font-size-0);
  }
}

.avatar-container {
  overflow: hidden;
  aspect-ratio: 1;
  border-radius: var(--radius-round);

  > img {
    transform: scale(5);

    display: block;

    width: 64px;
    height: 64px;

    object-fit: cover;
    object-position: 0 0;

    image-rendering: pixelated;
  }
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: var(--size-3);
  align-self: flex-start;

  padding-block-start: var(--size-2);

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
  display: flex;
  row-gap: var(--size-1);
  column-gap: var(--size-3);

  margin-top: var(--size-2);
  margin-bottom: var(--size-4);

  font-size: var(--font-size-1);
  line-height: 1;

  .skill-img {
    transform: translateY(5px);

    flex-shrink: 0;
    align-self: flex-start;

    aspect-ratio: 1;
    width: 48px;

    background-image: var(--border), var(--bg);
    background-size: contain;
  }

  p {
    margin: 0;
    margin: var(--size-1) 0;

    font-size: var(--font-size-00);
    white-space: break-spaces;

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

.skills-list {
  overflow-y: auto;
  margin-inline: calc(-1 * var(--size-6));
  padding-inline: var(--size-6);
}
</style>

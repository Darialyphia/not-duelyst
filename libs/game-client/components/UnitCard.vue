<script setup lang="ts">
import type { Entity } from '@hc/sdk';
import { unitImagesPaths } from '../assets/units';
import { skillImagesPaths } from '../assets/skills';

import havenBorder from '../assets/ui/icon-border-haven.png';
import chaosBorder from '../assets/ui/icon-border-chaos.png';
import { exhaustiveSwitch } from '../../shared/src';

const { entity } = defineProps<{
  entity: Entity;
}>();

const border = computed(() => {
  switch (entity.unit.faction.id) {
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
      <img :src="unitImagesPaths[entity.unit.spriteId]" />
    </div>
    <div class="text-center">{{ entity.unitId }}</div>

    <div class="stats">
      <div>
        <div class="i-game-icons:health-normal" style="--color: var(--hp)" />
        {{ entity.hp }} / {{ entity.maxHp }}
      </div>

      <div>
        <div class="i-game-icons-drop" style="--color: var(--ap)" />
        {{ entity.ap }} / {{ entity.maxAp }}
      </div>

      <div>
        <div class="i-game-icons-broadsword" style="--color: var(--attack)" />
        <span
          :class="{
            'is-buffed': entity.attack > entity.unit.attack,
            'is-debuffed': entity.attack < entity.unit.attack
          }"
        >
          {{ entity.attack }}
        </span>
      </div>

      <div>
        <div class="i-game-icons-rosa-shield" style="--color: var(--defense)" />
        <span
          :class="{
            'is-buffed': entity.defense > entity.unit.defense,
            'is-debuffed': entity.defense < entity.unit.defense
          }"
        >
          {{ entity.defense }}
        </span>
      </div>

      <div>
        <div class="i-mdi:run-fast" style="--color: var(--speed)" />
        <span
          :class="{
            'is-buffed': entity.speed > entity.unit.speed,
            'is-debuffed': entity.speed < entity.unit.speed
          }"
        >
          {{ entity.speed }}
        </span>
      </div>
    </div>

    <div v-for="skill in entity.skills" :key="skill.id" class="skill">
      <div
        class="skill-img"
        :data-cost="skill.cost"
        :data-cooldown="
          entity.skillCooldowns[skill.id] > 0 ? entity.skillCooldowns[skill.id] : ''
        "
        :style="{
          '--cooldown-angle':
            360 - (360 * entity.skillCooldowns[skill.id]) / skill.cooldown,
          '--bg': `url(${skillImagesPaths[skill.spriteId]})`,
          '--border': `url(${border})`
        }"
      />

      <div class="flex flex-col gap-1">
        {{ skill.id }}
        <p>{{ skill.getDescription(entity) }}</p>
      </div>
    </div>

    <ul>
      <li
        v-for="trigger in entity.effects"
        :key="trigger.id"
        class="flex gap-2 items-center text-0 my-2"
      >
        <div class="i-game-icons-time-trap" />
        {{ trigger.id }}
      </li>
    </ul>

    <!-- <ul>
      <li
        v-for="aura in entity.auras"
        :key="aura.id"
        class="flex gap-2 items-center text-0 my-2"
      >
        <div class="i-game-icons-beams-aura" />
        {{ aura.name }}
      </li>
    </ul> -->

    <!-- <ul>
      <li
        v-for="modifier in entity.modifiers"
        :key="modifier.id"
        class="flex gap-2 items-center text-0 my-2"
      >
        <div class="i-game-icons-abstract-086" />
        {{ modifier.name }}
        <template v-if="modifier.duration !== Infinity">
          ({{ modifier.duration.toFixed(1) }} turns left)
        </template>
      </li>
    </ul> -->
  </article>
</template>

<style scoped lang="postcss">
.entity-card {
  --hp: var(--green-5);
  --ap: var(--indigo-8);
  --attack: var(--red-7);
  --defense: var(--cyan-5);
  --speed: var(--yellow-3);

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
.is-buffed {
  color: var(--green-6);
}
.is-debuffed {
  color: var(--red-6);
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

    &::before {
      content: attr(data-cooldown);

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

      background: conic-gradient(
        hsl(var(--gray-11-hsl) / 0.1) calc(1deg * var(--cooldown-angle)),
        hsl(var(--gray-11-hsl) / 0.5) calc(1deg * var(--cooldown-angle))
      );
      border: none;
    }
  }

  p {
    grid-column: 2;
    margin: 0;
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

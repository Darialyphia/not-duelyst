<script setup lang="ts">
import type { Entity } from '@hc/sdk';
import cardBack from '../assets/ui{m}/card-back.png';

const { entity } = defineProps<{
  entity: Entity;
}>();
</script>

<template>
  <article class="entity-card fancy-surface" :style="{ '--bg': `url(${cardBack})` }">
    <div class="avatar-container fancy-surface mx-auto">
      <img :src="`/assets/units/${entity.unit.spriteId}-icon.png`" />
    </div>
    <div class="text-center">{{ entity.unitId }}</div>

    <div class="stats">
      <div>
        <div class="i-game-icons:health-normal" style="--color: var(--hp)" />
        {{ entity.hp }} / {{ entity.maxHp }}
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

    <p v-if="entity.unit.onSummoned?.getDescription">
      On summoned: {{ entity.unit.onSummoned.getDescription(entity.unit) }}
    </p>

    <p v-for="(trigger, index) in entity.unit.effects" :key="index">
      {{ trigger.description }}
    </p>

    <ul v-for="skill in entity.skills" :key="skill.id" class="skill">
      <div
        class="skill-img"
        :data-cooldown="
          entity.skillCooldowns[skill.id] > 0 ? entity.skillCooldowns[skill.id] : ''
        "
        :style="{
          '--cooldown-angle':
            360 - (360 * entity.skillCooldowns[skill.id]) / skill.cooldown,
          '--bg': `url('/assets/skills/${skill.spriteId}.png')`,
          '--border': `url(${borders.square})`
        }"
      />

      <div class="grid gap-1">
        {{ skill.name }}
        <p>{{ skill.getText(entity) }}</p>
      </div>
    </ul>

    <ul>
      <li
        v-for="effect in entity.effects"
        :key="effect.id"
        class="gap-2 items-center text-0 my-2"
      >
        <div class="i-game-icons-time-trap" />
        {{ effect.id }}
        <span v-if="isFinite(effect.duration)">({{ effect.duration }} turns left)</span>
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
  </article>
</template>

<style scoped lang="postcss">
.entity-card {
  --hp: var(--green-5);
  --ap: var(--cyan-5);
  --attack: var(--red-7);
  --speed: var(--blue-6);

  width: 18rem;
  padding: 0 var(--size-6) var(--size-6);

  font-size: var(--font-size-2);

  background: linear-gradient(transparent, #111), var(--bg), var(--fancy-bg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  background-blend-mode: soft-light;
  backdrop-filter: blur(5px);
  border-image: var(--border);
  border-image-slice: 31;
  border-image-width: 32px;
  border-image-repeat: repeat;

  > p {
    margin-block: var(--size-1);
    font-size: var(--font-size-0);
  }
}

.avatar-container {
  transform: translateY(-25%);

  overflow: hidden;

  aspect-ratio: 1;
  width: var(--size-11);
  padding: var(--size-1);

  border-radius: var(--radius-round);

  > img {
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
    margin: var(--size-1) 0;
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
../assets/units{m} ../assets/skills{}

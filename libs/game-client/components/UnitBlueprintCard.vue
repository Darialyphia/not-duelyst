<script setup lang="ts">
import type { Skill, UnitBlueprint } from '@hc/sdk';
import cardBack from '../assets/ui{m}/card-back.png';
import unitCostBg from '../assets/ui{m}/unit-cost-background.png';
import type { Nullable } from '@hc/shared';

const { unit } = defineProps<{
  unit: UnitBlueprint;
}>();

const borders = computed(() => factionUtils[unit.faction.id].borders);

const selectedSkill = ref<Nullable<Skill>>(null);
</script>

<template>
  <article
    class="entity-card fancy-surface"
    :style="{ '--border': `url(${borders.square})`, '--bg': `url(${cardBack})` }"
  >
    <div class="flex justify-between">
      <div class="relative">
        <div
          v-if="unit.kind !== 'GENERAL'"
          class="cost"
          :style="{ '--bg': `url(${unitCostBg})` }"
        >
          {{ unit.summonCost }}
        </div>

        <div class="avatar-container fancy-surface">
          <img :src="`/assets/units/${unit.spriteId}-icon.png`" />
        </div>
      </div>

      <div class="stats">
        <UiSimpleTooltip text="hit points" side="left">
          <div>
            <div class="i-game-icons:health-normal" style="--color: var(--hp)" />
            {{ unit.maxHp }}
          </div>
        </UiSimpleTooltip>

        <UiSimpleTooltip text="attack" side="left">
          <div>
            <div class="i-game-icons-broadsword" style="--color: var(--attack)" />
            <span>
              {{ unit.attack }}
            </span>
          </div>
        </UiSimpleTooltip>

        <UiSimpleTooltip text="speed" side="left">
          <div>
            <div class="i-mdi:run-fast" style="--color: var(--speed)" />
            <span>
              {{ unit.speed }}
            </span>
          </div>
        </UiSimpleTooltip>

        <UiSimpleTooltip text="cooldown" side="right">
          <div>
            <div class="i-tabler:hourglass" />
            <span>
              {{ unit.summonCooldown }}
            </span>
          </div>
        </UiSimpleTooltip>
      </div>
    </div>
    <div class="unit-name">{{ unit.id }}</div>

    <div class="px-2">
      <p v-if="selectedSkill">{{ selectedSkill.getText(unit) }}</p>
      <template v-else>
        <p v-if="unit.onSummoned?.getDescription">
          On summoned: {{ unit.onSummoned.getDescription(unit) }}
        </p>
        <p v-for="(trigger, index) in unit.effects" :key="index">
          {{ trigger.description }}
        </p>
      </template>
    </div>

    <ul class="skills-list">
      <li v-for="skill in unit.skills" :key="skill.id" class="skill">
        <div
          class="px-2"
          @mouseenter="selectedSkill = skill"
          @mouseleave="selectedSkill = null"
        >
          <div
            class="skill-img"
            tabindex="0"
            :data-cooldown="skill.cooldown"
            :style="{
              '--bg': `url('/assets/skills/${skill.spriteId}.png')`,
              '--border': `url(${borders.square})`
            }"
            :class="selectedSkill?.id === skill.id && 'selected'"
            @focus="selectedSkill = skill"
          />
        </div>
      </li>
    </ul>
  </article>
</template>

<style scoped lang="postcss">
.entity-card {
  --hp: var(--green-5);
  --ap: var(--cyan-5);
  --attack: var(--red-7);
  --speed: var(--blue-6);

  user-select: none;

  display: grid;
  grid-template-rows: auto auto 1fr auto;

  width: 17rem;
  padding: var(--size-3) var(--size-4) var(--size-6);

  font-size: var(--font-size-2);
  color: white;

  background: linear-gradient(transparent, #111), var(--bg), var(--fancy-bg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  background-blend-mode: soft-light;
  border-image: var(--border);
  border-image-slice: 31;
  border-image-width: 32px;

  image-rendering: pixelated;
  p {
    margin-block: var(--size-1);
    font-size: var(--font-size-0);
  }
}

.cost {
  position: absolute;
  transform: translate(-25%, -25%);

  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: var(--size-7);

  font-weight: var(--font-weight-5);
  color: black;

  background: var(--bg);
  border-radius: var(--radius-round);
}
.avatar-container {
  overflow: hidden;
  align-self: center;
  padding: 0;
  border-radius: var(--radius-round);

  > img {
    display: block;

    aspect-ratio: 1;
    width: 96px;

    object-fit: cover;

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
    &.selected {
      filter: contrast(130%) brightness(110%);
      outline: var(--fancy-border);
    }
  }

  [data-cooldown] {
    position: relative;
    &::after {
      content: attr(data-cooldown);

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
  display: flex;
  justify-content: center;
}

.selected-skill {
  height: var(--size-11);
  p {
    margin: 0;
    margin: var(--size-1) 0;

    font-size: var(--font-size-00);
    white-space: break-spaces;

    opacity: 0.8;
  }
}

.unit-name {
  margin-block: var(--size-2);

  font-size: var(--font-size-4);
  font-weight: 600;
  text-align: center;
  text-transform: capitalize;
}
</style>

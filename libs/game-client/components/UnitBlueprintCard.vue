<script setup lang="ts">
import type { Skill, UnitBlueprint } from '@hc/sdk';
import type { Nullable } from '@hc/shared';

const { unit } = defineProps<{
  unit: UnitBlueprint;
}>();

const selectedSkill = ref<Nullable<Skill>>(null);
</script>

<template>
  <article
    class="entity-card"
    :style="{
      '--bg': `url('/assets/ui/card-back-v2.png')`,
      '--sprite': `url('/assets/units/${unit.spriteId}-icon.png')`
    }"
  >
    <div v-if="unit.kind !== 'GENERAL'" class="cost relative">
      {{ unit.summonCost }}

      <div class="flex justify-center gap-1 absolute bottom-0 w-full">
        <div
          v-for="(_, i) in 3"
          :key="i"
          class="rune"
          :style="{
            '--bg': `url('/assets/ui/rune-${
              unit.factions[i]?.id.toLowerCase() ?? 'empty'
            }.png')`
          }"
        ></div>
      </div>
    </div>

    <div class="cooldown">{{ unit.summonCooldown }}</div>

    <div class="unit-name">{{ unit.id }}</div>

    <div>
      <ul class="skills-list">
        <li v-for="skill in unit.skills" :key="skill.id" class="skill">
          <div
            class="skill-img"
            tabindex="0"
            :data-cooldown="skill.cooldown"
            :style="{
              '--bg': `url('/assets/skills/${skill.spriteId}.png')`
            }"
            :class="selectedSkill?.id === skill.id && 'selected'"
            @focus="selectedSkill = skill"
            @mouseenter="selectedSkill = skill"
            @mouseleave="selectedSkill = null"
          />
        </li>
      </ul>

      <div class="unit-text">
        <p v-if="selectedSkill">
          {{ selectedSkill.getText(unit) }}
        </p>
        <template v-else>
          <p v-if="unit.onSummoned?.getDescription">
            On summoned: {{ unit.onSummoned.getDescription(unit) }}
          </p>
          <p v-for="(trigger, index) in unit.effects" :key="index">
            {{ trigger.description }}
          </p>
        </template>
      </div>
    </div>

    <div class="stats">
      <div style="--bg: url('/assets/ui/unit-attack.png'); --color: var(--red-7)">
        {{ unit.attack }}
      </div>
      <div style="--bg: url('/assets/ui/unit-speed.png'); --color: var(--blue-6)">
        {{ unit.speed }}
      </div>
      <div style="--bg: url('/assets/ui/unit-defense.png'); --color: var(--green-6)">
        {{ unit.maxHp }}
      </div>
    </div>
  </article>
</template>

<style scoped lang="postcss">
.entity-card {
  user-select: none;

  position: relative;

  display: grid;
  grid-template-rows: auto 1fr;

  width: calc(2 * 134px);
  height: calc(2 * 188px);
  padding: var(--size-3) var(--size-4) var(--size-6);

  font-size: var(--font-size-2);
  color: white;

  background: var(--bg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;

  image-rendering: pixelated;

  &::before {
    content: '';

    position: absolute;
    z-index: -1;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);

    aspect-ratio: 1;
    width: 128px;

    background: var(--sprite), linear-gradient(135deg, var(--gray-9), var(--gray-12));
    background-size: cover;
  }

  p {
    margin-block: var(--size-1);
    font-size: var(--font-size-0);
  }
}

.cost {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-30%, -30%);

  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: 68px;

  font-size: var(--font-size-5);
  font-weight: var(--font-weight-7);
  color: black;

  background: url('/assets/ui/unit-cost-bg-v2.png');
  background-size: cover;
}

.cooldown {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(20px, -14px);

  display: grid;
  place-content: center;

  width: 64px;
  height: 64px;

  font-size: var(--font-size-5);
  font-weight: 700;
  color: var(--primary);

  background: url('/assets/ui/unit-cooldown.png');
  background-size: cover;
}
.rune {
  width: 18px;
  height: 20px;
  background-image: var(--bg);
  background-size: contain;

  &:nth-of-type(2) {
    transform: translateY(5px);
  }
}
.avatar-container {
  transform: translateY(-8px);

  overflow: hidden;
  align-self: center;

  padding: 0;

  border-radius: var(--radius-round);

  > img {
    display: block;

    aspect-ratio: 1;
    width: 128px;

    object-fit: cover;

    image-rendering: pixelated;
  }
}

.stats {
  position: absolute;
  bottom: 0;
  transform: translateX(-23px) translateY(20px);

  display: flex;
  justify-content: space-between;

  width: calc(100% + 44px);
  > div {
    display: grid;
    place-content: center;

    aspect-ratio: 1;
    width: 64px;

    font-size: var(--font-size-5);
    font-weight: 700;
    color: var(--color);

    background: var(--bg);
    background-size: cover;
  }
}

.skill {
  display: flex;
  row-gap: var(--size-1);
  column-gap: var(--size-3);

  font-size: var(--font-size-1);
  line-height: 1;

  .skill-img {
    aspect-ratio: 1;
    width: 48px;
    background: url('/assets/ui/skill-border.png'), var(--bg);
    background-size: contain;
    &.selected {
      filter: contrast(130%) brightness(110%);
      outline: var(--fancy-border);
      outline-offset: 4px;
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
  margin-top: 140px;
  margin-inline: var(--size-3);

  font-size: var(--font-size-3);
  font-weight: 600;
  text-align: center;
  text-transform: capitalize;
}

.unit-text {
  margin-inline: auto;
  padding-inline: var(--size-4);
}
</style>

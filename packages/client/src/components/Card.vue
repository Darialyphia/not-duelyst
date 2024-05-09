<script setup lang="ts">
import type { CardBlueprint, SkillBlueprint } from '@game/sdk/src/card/card-blueprint';
import { type CardKind, type Rarity } from '@game/sdk/src/card/card-utils';
import type { Nullable } from '@game/shared';

type ICard = {
  kind: CardKind;
  name: string;
  description: string;
  spriteId: string;
  rarity: Rarity;
  attack?: number;
  hp?: number;
  cost: number;
  cooldown: number;
  speed: number;
  skills: SkillBlueprint[];
  pedestalId?: string;
  factions: CardBlueprint['factions'];
};

const { card } = defineProps<{ card: ICard }>();

const bg = computed(() => `url('/assets/ui/card-back-${card.rarity}.png')`);

const selectedSkill = ref<Nullable<SkillBlueprint>>(null);
</script>

<template>
  <div class="card">
    <header>
      <UiCenter class="cost">
        {{ card.cost }}

        <div>
          <div
            v-for="(faction, index) in card.factions"
            :key="`${faction?.id}${index}`"
            class="faction"
            :style="{
              '--bg': `url(/assets/ui/rune-${faction?.id.toLocaleLowerCase() ?? 'empty'}.png)`
            }"
          />
        </div>
      </UiCenter>
      <CardSprite
        class="sprite"
        :sprite-id="card.spriteId"
        :pedestal-id="card.pedestalId ?? 'pedestal-default'"
      />
      <UiCenter v-if="card.cooldown" class="cooldown">
        {{ card.cooldown }}
      </UiCenter>
    </header>

    <div class="text">
      <div class="kind">{{ card.kind }}</div>
      <div class="name">{{ card.name }}</div>
    </div>

    <ul class="skills-list">
      <li
        v-for="skill in card.skills"
        :key="skill.id"
        class="skill"
        @mouseenter="selectedSkill = skill"
        @mouseleave="selectedSkill = null"
      >
        <div
          class="skill-img"
          tabindex="0"
          :data-cooldown="skill.cooldown"
          :style="{
            '--bg': `url('/assets/icons/${skill.iconId}.png')`
          }"
          :class="selectedSkill?.id === skill.id && 'selected'"
          @focus="selectedSkill = skill"
          @blur="selectedSkill = null"
        />
      </li>
    </ul>

    <div class="description">
      <template v-if="selectedSkill">
        <p class="text-0 color-gray-0 mb-1 font-700">
          {{ selectedSkill.name }}
        </p>
        <p class="text-00">
          {{ selectedSkill.description }}
        </p>
      </template>

      <p v-else class="text-00">{{ card.description }}</p>
    </div>

    <footer>
      <UiCenter class="attack">{{ card.attack }}</UiCenter>
      <UiCenter class="speed">{{ card.speed }}</UiCenter>
      <UiCenter class="hp">{{ card.hp }}</UiCenter>
    </footer>
  </div>
</template>

<style scoped lang="postcss">
.card {
  --z-translate: 25px;

  position: relative;
  transform-style: preserve-3d;

  display: grid;
  grid-template-rows: auto auto auto 1fr auto;

  width: 286px;
  height: 396px;

  font-size: var(--font-size-4);

  background: v-bind(bg);

  image-rendering: pixelated;
}

header {
  transform-style: preserve-3d;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-content: end;

  height: 112px;
}

.cost {
  position: relative;
  transform: translateY(calc(-1 * var(--size-2)));

  justify-self: start;

  width: 76px;
  height: 76px;

  font-weight: 700;
  color: black;

  background-image: url('/assets/ui/card-cost.png');
}

.faction {
  width: 22px;
  height: 26px;
  background: var(--bg);

  &:nth-of-type(2) {
    transform: translateY(25%);
  }

  :has(> &) {
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: space-between;
  }
}

.cooldown {
  transform: translateY(-5px);

  justify-self: end;

  width: 76px;
  height: 76px;

  font-weight: 7 00;
  color: #be8420;

  background-image: url('/assets/ui/card-cooldown.png');
}

.sprite {
  position: relative;
  transform-origin: bottom center;
  transform: translateZ(var(--z-translate)) scale(2) translateY(40%);
  transition: transform 0.3s ease-in;
}

.text {
  transform: translateZ(var(--z-translate));

  margin-block: calc(var(--size-8) + var(--size-2)) var(--size-1);

  font-weight: 400;
  line-height: 1;
  text-align: center;

  transition: transform 0.3s ease-in;

  > .kind {
    font-size: var(--font-size-00);
    color: var(--gray-5);
  }

  > .name {
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-7);
  }
}

footer {
  transform: translateY(var(--size-1));

  display: grid;
  grid-template-columns: repeat(3, 1fr);

  height: 76px;
  margin-top: auto;

  font-weight: var(--font-weight-7);
  > * {
    aspect-ratio: 1;
    padding-bottom: 5px;
  }
}

.attack {
  justify-self: start;
  color: #ff2245;
  background-image: url('/assets/ui/card-attack.png');
}

.speed {
  justify-self: center;
  color: #0084db;
  background-image: url('/assets/ui/card-speed.png');
}

.hp {
  justify-self: end;
  color: #a7ed00;
  background-image: url('/assets/ui/card-hp.png');
}

.skills-list {
  transform: translateZ(var(--z-translate));
  display: flex;
  justify-content: center;
  transition: transform 0.3s ease-in;

  > li {
    display: flex;
    gap: var(--size-2);
    align-items: center;

    margin-top: var(--size-2);
    margin-bottom: var(--size-2);

    font-size: var(--font-size-0);
    line-height: 1;
  }
}

.skill {
  display: flex;
  row-gap: var(--size-1);
  column-gap: var(--size-3);

  padding-inline: var(--size-2);

  font-size: var(--font-size-1);
  line-height: 1;

  .skill-img {
    aspect-ratio: 1;
    width: 38px;
    background: var(--bg);
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

.description {
  transform: translateZ(var(--z-translate));

  justify-self: center;

  max-width: calc(var(--size-12) + var(--size-7));
  margin-top: var(--size-2);

  line-height: 1;
  color: var(--gray-0);
  text-align: center;

  transition: transform 0.3s ease-in;
}
</style>

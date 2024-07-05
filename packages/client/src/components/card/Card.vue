<script setup lang="ts">
import type { CardBlueprint } from '@game/sdk/src/card/card-blueprint';
import {
  FACTION_IDS,
  MULTICOLOR,
  type CardKind,
  type Keyword,
  type Rarity
} from '@game/sdk';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/vue';
import type { CardBlueprintId } from '@game/sdk/src/card/card';
import type { Tribe } from '@game/sdk/src/utils/tribes';

type ICard = {
  blueprintId: CardBlueprintId;
  kind: CardKind;
  name: string;
  description: string;
  spriteId: string;
  rarity: Rarity;
  attack?: number;
  hp?: number;
  cost: number;
  speed: number;
  pedestalId?: string;
  faction: CardBlueprint['faction'];
  keywords?: Keyword[];
  tribes: Tribe[];
};

const { card, hasModal = false } = defineProps<{ card: ICard; hasModal?: boolean }>();

const bg = computed(() => `url('/assets/ui/card-back-${card.rarity}.png')`);

const reference = ref(null);
const floating = ref(null);
const { floatingStyles } = useFloating(reference, floating, {
  strategy: 'fixed',
  middleware: [offset({ mainAxis: 15 }), flip()],
  whileElementsMounted: autoUpdate,
  placement: 'right-start'
});

const isHovered = ref(false);
const isModalOpened = ref(false);
</script>

<template>
  <div
    ref="reference"
    class="card"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @contextmenu.prevent="
      () => {
        if (hasModal) {
          isModalOpened = true;
        }
      }
    "
  >
    <header>
      <UiCenter v-if="card.kind === 'MINION'" class="cost">
        <span>{{ card.cost }}</span>
      </UiCenter>
      <div v-else />
      <CardSprite
        class="sprite"
        :sprite-id="card.spriteId"
        :pedestal-id="card.pedestalId ?? 'pedestal-default'"
      />
    </header>

    <div class="text">
      <div class="kind">
        {{ card.kind }}
        <template v-if="card.tribes.length">
          - {{ card.tribes.map(tribe => tribe.name).join(', ') }}
        </template>
      </div>
      <div class="name">{{ card.name }}</div>
    </div>

    <div class="description">
      <p class="text-00 whitespace-pre-line">
        <TextWithKeywords :text="card.description" />
      </p>
    </div>

    <footer>
      <UiCenter class="attack">{{ card.attack }}</UiCenter>
      <UiCenter class="speed">{{ card.speed }}</UiCenter>
      <UiCenter class="hp">{{ card.hp }}</UiCenter>
    </footer>

    <Teleport to="body">
      <ul
        v-if="isHovered && card.keywords && card.keywords.length"
        ref="floating"
        class="keywords"
        :style="floatingStyles"
      >
        <li v-for="keyword in card.keywords" :key="keyword.name" class="grid">
          <div class="font-600">{{ keyword.name }}</div>
          <p class="text-0">{{ keyword.description }}</p>
        </li>
      </ul>
    </Teleport>

    <CardModal v-model:is-opened="isModalOpened" :blueprint-id="card.blueprintId" />
  </div>
</template>

<style scoped lang="postcss">
.card {
  --z-translate: 25px;

  user-select: none;

  position: relative;
  transform-style: preserve-3d;

  display: grid;
  grid-template-rows: auto auto auto 1fr auto;

  width: 286px;
  height: 410px;

  font-size: var(--font-size-4);

  background: v-bind(bg);

  image-rendering: pixelated;
}

header {
  transform-style: preserve-3d;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-content: end;

  height: 104px;
}

.cost {
  position: relative;
  transform: translateY(var(--size-2));

  justify-self: start;

  width: 76px;
  height: 76px;

  font-weight: 700;
  color: black;

  background-image: url('/assets/ui/card-cost.png');
}

.faction {
  position: absolute;

  display: grid;
  place-content: center;

  width: 22px;
  height: 22px;

  font-size: var(--font-size-0);
  color: var(--color, white);

  background: black;
  border: solid 2px currentColor;
  border-radius: var(--radius-round);

  &:nth-of-type(1) {
    top: 44px;
    left: -6px;
  }
  &:nth-of-type(2) {
    top: 10px;
    left: -6px;
  }
  &:nth-of-type(3) {
    top: -4px;
    left: 26px;
  }
  &:nth-of-type(4) {
    top: 10px;
    left: 56px;
  }
  &:nth-of-type(5) {
    top: 44px;
    left: 56px;
  }
  &:nth-of-type(6) {
    top: 58px;
    left: 26px;
  }
}

.sprite {
  position: relative;
  transform-origin: bottom center;
  transform: translateZ(var(--z-translate)) scale(2) translateY(40%);

  /* filter: drop-shadow(0px -1px 0 white) drop-shadow(0px 1px 0 white)
    drop-shadow(-1px 0px 0 white) drop-shadow(1px 0px 0 white); */

  transition: transform 0.3s ease-in;
}

.text {
  transform: translateZ(var(--z-translate));

  margin-block: calc(var(--size-8) + var(--size-3)) var(--size-1);

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

.description {
  transform: translateZ(var(--z-translate));

  justify-self: center;

  max-width: calc(var(--size-12) + var(--size-7));
  margin-top: var(--size-2);

  line-height: 1;
  color: var(--gray-0);
  text-wrap: balance;

  transition: transform 0.3s ease-in;
}

.keywords {
  z-index: 10;

  display: grid;
  gap: var(--size-4);

  width: var(--size-14);
  padding: var(--size-3);

  background-color: black;
}
</style>

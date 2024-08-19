<script setup lang="ts">
import type { CardBlueprint } from '@game/sdk/src/card/card-blueprint';
import { CARD_KINDS } from '@game/sdk';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/vue';
import type { CardBlueprintId } from '@game/sdk/src/card/card';
import type { Prettify } from '@game/shared';
import { match } from 'ts-pattern';

type ICard = Prettify<
  {
    blueprintId: CardBlueprintId;
    pedestalId?: string;
    cardbackId?: string;
    hp?: CardBlueprint['maxHp'];
    spriteId?: CardBlueprint['spriteId'];
  } & Pick<
    CardBlueprint,
    | 'name'
    | 'description'
    | 'cost'
    | 'kind'
    | 'rarity'
    | 'faction'
    | 'keywords'
    | 'tags'
    | 'attack'
    | 'speed'
  >
>;

const { card, hasModal = false } = defineProps<{ card: ICard; hasModal?: boolean }>();

const bg = computed(
  () =>
    `url('/assets/ui/card-back-${card.cardbackId ?? 'default'}.png'), url('/assets/ui/card-back-${card.rarity}.png')`
);

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

const animation = computed(() => {
  return match(card.kind)
    .with(CARD_KINDS.GENERAL, CARD_KINDS.MINION, () =>
      isHovered.value ? ('idle' as const) : ('breathing' as const)
    )
    .with(CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, () =>
      isHovered.value ? ('active' as const) : ('default' as const)
    )
    .exhaustive();
});

const isUnit = computed(
  () => card.kind === CARD_KINDS.GENERAL || card.kind === CARD_KINDS.MINION
);
</script>

<template>
  <div
    ref="reference"
    class="card"
    :class="card.kind.toLocaleLowerCase()"
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
      <UiCenter class="cost">
        <span>{{ card.cost }}</span>
      </UiCenter>
      <div class="sprite-3d-wrapper">
        <CardSprite
          v-if="card.spriteId"
          class="sprite"
          :sprite-id="card.spriteId"
          :pedestal-id="isUnit ? (card.pedestalId ?? 'pedestal-default') : undefined"
          :animation="animation"
          :is-hovered="isHovered"
        />
      </div>
      <div
        class="faction"
        :style="{ '--bg': `url(/assets/ui/icon_${card.faction?.id ?? 'neutral'}.png)` }"
      />
    </header>

    <div class="text">
      <div class="kind">
        {{ card.kind }}
        <template v-if="card.tags?.length">
          - {{ card.tags.map(tag => tag.name).join(', ') }}
        </template>
      </div>
      <div class="name">{{ card.name }}</div>
    </div>

    <div class="description">
      <TextWithKeywords :text="card.description" />
    </div>

    <footer>
      <UiCenter
        v-if="card.kind === CARD_KINDS.GENERAL || card.kind === CARD_KINDS.MINION"
        class="attack"
      >
        {{ card.attack }}
      </UiCenter>
      <UiCenter
        v-if="card.kind === CARD_KINDS.GENERAL || card.kind === CARD_KINDS.MINION"
        class="hp"
      >
        {{ card.hp }}
      </UiCenter>
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

    <CardModal
      v-model:is-opened="isModalOpened"
      :blueprint-id="card.blueprintId"
      :cardback-id="card.cardbackId"
    />
  </div>
</template>

<style scoped lang="postcss">
.card {
  --z-translate: 40px;

  user-select: none;

  position: relative;
  transform-style: preserve-3d;

  display: grid;
  grid-template-rows: auto auto 1fr 76px;

  width: 286px;
  height: 410px;

  font-size: var(--font-size-4);

  background-image: v-bind(bg);

  image-rendering: pixelated;

  transition: background-image 0.5s ease-in;

  @screen lt-lg {
    width: 260px;
    height: 350px;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
}

header {
  transform-style: preserve-3d;

  display: grid;
  grid-template-columns: 76px 1fr 76px;
  align-content: start;

  height: 105px;
}
.cost {
  position: relative;

  align-self: start;
  justify-self: start;

  width: 76px;
  height: 76px;

  font-weight: 700;
  color: black;

  background-image: url('/assets/ui/card-cost.png');

  .card.general & {
    visibility: hidden;
  }
}

.faction {
  position: relative;
  /* transform: translateY(var(--size-2)); */

  justify-self: end;
  aspect-ratio: 1;
  /* width: 76px; */

  background-image: var(--bg);
}

.sprite-3d-wrapper {
  transform: translateZ(var(--z-translate));
}

.sprite {
  position: relative;
  transform-origin: bottom left;
  transform: scale(2) translate(-25%, 50%);

  height: 100%;

  transition: transform 0.3s ease-in;

  :is(.spell, .artifact) & {
    transform: translateZ(var(--z-translate)) scale(2) translate(-25%, 35%);
  }
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
    margin-top: var(--size-2);
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-7);
  }
}

footer {
  transform: translateY(var(--size-1));

  display: flex;
  justify-content: space-between;

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

  /* align-self: start; */
  justify-self: center;

  width: 100%;
  max-width: calc(var(--size-12) + var(--size-7));

  @screen lt-lg {
    max-width: calc(var(--size-12) + var(--size-3));
  }

  margin-top: var(--size-2);

  font-size: var(--font-size-0);
  line-height: 1.2;
  color: var(--gray-0);
  white-space: pre-line;

  /* background-color: hsl(0 0 0 / 0.35); */
  /* border: solid var(--border-size-1) var(--border-dimmed); */
  border-radius: var(--radius-2);

  transition: transform 0.3s ease-in;
}

.keywords {
  z-index: 10;

  display: grid;
  gap: var(--size-4);

  width: var(--size-14);
  padding: var(--size-3);

  background-color: black;

  @screen lt-lg {
    display: none;
  }
}
</style>

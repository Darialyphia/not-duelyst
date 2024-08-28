<script setup lang="ts">
import { CARD_KINDS, CARDS, type CardKind } from '@game/sdk';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';
import { uniqBy } from 'lodash-es';

const { loadout } = defineProps<{
  loadout: {
    name: string;
    cards: Array<{
      id: string;
      pedestalId: string;
      cardBackId: string;
    }>;
  };
}>();

const isOpened = defineModel<boolean>('isOpened', { required: true });

const groupedCards = computed(() => {
  const copies: Record<string, number> = {};
  loadout.cards.forEach(card => {
    if (!copies[card.id]) {
      copies[card.id] = 1;
    } else {
      copies[card.id]++;
    }
  });

  return uniqBy(
    loadout.cards
      .map(card => ({
        ...card,
        card: parseSerializeBlueprint(CARDS[card.id]),
        copies: copies[card.id]
      }))
      .sort((a, b) => {
        if (a.card.kind === CARD_KINDS.GENERAL) return -1;
        if (b.card.kind === CARD_KINDS.GENERAL) return 1;
        if (a.card.cost === b.card.cost) return a.card.name.localeCompare(b.card.name);
        return a.card.cost - b.card.cost;
      }),
    'id'
  );
});

const general = computed(
  () => groupedCards.value.find(group => group.card.kind === CARD_KINDS.GENERAL)!
);

const minions = computed(
  () => groupedCards.value.filter(group => group.card.kind === CARD_KINDS.MINION)!
);
const spells = computed(
  () => groupedCards.value.filter(group => group.card.kind === CARD_KINDS.SPELL)!
);
const artifacts = computed(
  () => groupedCards.value.filter(group => group.card.kind === CARD_KINDS.ARTIFACT)!
);

const getCountByKind = (kind: CardKind) => {
  return loadout.cards.filter(c => CARDS[c.id].kind === kind).length;
};

const cardsCount = computed(() => {
  return loadout.cards.length;
});
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    :title="loadout.name"
    :style="{ '--ui-modal-size': 'var(--size-lg)' }"
  >
    <template #title>
      <div class="header">
        <img :src="`/assets/ui/icon_${general.card.faction!.id}.png`" />
        <div>
          <div>{{ loadout.name }}</div>
        </div>
        <div class="flex text-1 font-4">
          <div class="counts">
            <div>
              <span>{{ getCountByKind('MINION') }}</span>
              Minions
            </div>
            <div>
              <span>{{ getCountByKind('SPELL') }}</span>
              Spells
            </div>
            <div>
              <span>{{ getCountByKind('ARTIFACT') }}</span>
              Artifacts
            </div>
            <div>
              <span>{{ cardsCount }}</span>
              Total
            </div>
          </div>
          <LoadoutStats
            :loadout="loadout.cards"
            class="flex-1"
            :style="{ '--bar-size': 'var(--size-11)' }"
          />
        </div>
      </div>
    </template>

    <div ref="root" class="root fancy-scrollbar">
      <ul class="minions-list">
        <li>
          <CardSprite
            :sprite-id="general.card.spriteId"
            :pedestal-id="general.pedestalId"
            animation="breathing"
            :animated="false"
          />
        </li>
        <li v-for="minion in minions" :key="minion.id">
          <CardSprite
            :sprite-id="minion.card.spriteId"
            :pedestal-id="minion.pedestalId"
            animation="breathing"
            :animated="false"
            class="h-full"
          />
          <div>{{ minion.copies }}</div>
        </li>
      </ul>

      <div class="group">
        <ul class="spells-list">
          <li v-for="spell in spells" :key="spell.id">
            <CardSprite
              :sprite-id="spell.card.spriteId"
              animation="default"
              :animated="false"
              class="h-full"
            />
            <div>{{ spell.copies }}</div>
          </li>
        </ul>

        <ul class="artifact-list">
          <li v-for="artifact in artifacts" :key="artifact.id">
            <CardSprite
              :sprite-id="artifact.card.spriteId"
              animation="default"
              :animated="false"
              class="h-full"
            />
            <div>{{ artifact.copies }}</div>
          </li>
        </ul>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <div class="text-2 mb-2">
            <span class="font-5 c-primary">{{ minions.length }}</span>
            Minions
          </div>
          <ul>
            <li v-for="minion in minions" :key="minion.id">
              {{ minion.copies }} x
              <span :class="minion.card.rarity.toLocaleLowerCase()">
                {{ minion.card.name }}
              </span>
            </li>
          </ul>
        </div>
        <div>
          <div class="text-2 mb-2">
            <span class="font-5 c-primary">{{ spells.length }}</span>
            Spells
          </div>
          <ul>
            <li v-for="spell in spells" :key="spell.id">
              {{ spell.copies }} x
              <span :class="spell.card.rarity.toLocaleLowerCase()">
                {{ spell.card.name }}
              </span>
            </li>
          </ul>
        </div>
        <div>
          <div class="text-2 mb-2">
            <span class="font-5 c-primary">{{ artifacts.length }}</span>
            Artifacts
          </div>
          <ul>
            <li v-for="artifact in artifacts" :key="artifact.id">
              {{ artifact.copies }} x
              <span :class="artifact.card.rarity.toLocaleLowerCase()">
                {{ artifact.card.name }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
:has(> .root) {
  overflow-y: auto;
  max-height: 100dvh;
}
.header {
  display: grid;
  grid-template-columns: auto 4fr 3fr;
  gap: var(--size-3);
  align-items: center;
}
.counts {
  align-self: center;
  > div > span {
    font-size: var(--font-size-3);
    color: var(--primary);
  }
}

.minions-list {
  display: grid;
  grid-template-columns: repeat(14, minmax(0, 1fr));
  margin: var(--size-5) var(--size-4) var(--size-5);

  > li {
    aspect-ratio: 1;
    > div:first-of-type {
      pointer-events: none;
      transform-origin: bottom center;
      height: 100%;
    }

    > div:last-of-type {
      text-align: center;
    }
  }
}

.spells-list,
.artifact-list {
  display: grid;
  gap: var(--size-2);
  > li {
    aspect-ratio: 1;
    > div:first-of-type {
      pointer-events: none;
      transform-origin: bottom center;
      height: 100%;
    }

    > div:last-of-type {
      text-align: center;
    }
  }
}

.spells-list {
  grid-template-columns: repeat(16, minmax(0, 1fr));
  margin: 0 var(--size-6) var(--size-8) 0;
}
.artifact-list {
  direction: rtl;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  margin: 0 0 var(--size-8) var(--size-6);
}

.group {
  display: grid;
  grid-template-columns: 9fr 4.5fr;
}

.basic,
.common,
.rare,
.epic,
.legendary {
  font-weight: var(--font-weight-5);
}

.rare {
  color: var(--blue-7);
}

.epic {
  color: var(--purple-8);
}

.legendary {
  color: var(--primary);
}
</style>

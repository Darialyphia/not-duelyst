<script setup lang="ts">
import { config, CARD_KINDS, CARDS, type CardBlueprint } from '@game/sdk';
import { uniqBy } from 'lodash-es';

const { isSaving, cards } = defineProps<{
  cards: Array<{ id: string; pedestalId: string }>;
  isSaving: boolean;
}>();

const emit = defineEmits<{
  save: [];
  remove: [CardBlueprint];
  setPedestal: [{ id: string; pedestalId: string }];
  back: [];
}>();

const name = defineModel<string>('name', { required: true });

const groupedUnits = computed(() => {
  const copies: Record<string, number> = {};
  cards.forEach(card => {
    if (!copies[card.id]) {
      copies[card.id] = 1;
    } else {
      copies[card.id]++;
    }
  });

  return uniqBy(
    cards
      .map(card => ({ ...card, card: CARDS[card.id], copies: copies[card.id] }))
      .sort((a, b) => {
        if (a.card.kind === CARD_KINDS.GENERAL) return -1;
        if (b.card.kind === CARD_KINDS.GENERAL) return 1;
        return a.card.cost - b.card.cost;
      }),
    'id'
  );
});

// TODO load user owned cosmetics from api
const pedestals = [
  'pedestal-default',
  'pedestal-stone',
  'pedestal-grass',
  'pedestal-ocean',
  'pedestal-cyber',
  'pedestal-lava',
  'pedestal-sand'
];
const changePedestal = (id: string, diff: number) => {
  const card = cards.find(c => c.id === id)!;
  const index = pedestals.indexOf(card.pedestalId);
  let newIndex = (index + diff) % pedestals.length;
  if (newIndex < 0) newIndex = pedestals.length - 1;

  emit('setPedestal', { id, pedestalId: pedestals[newIndex] });
};

const minionsCount = computed(() => {
  return cards.filter(c => CARDS[c.id].kind === CARD_KINDS.MINION).length;
});
</script>

<template>
  <form @submit.prevent="emit('save')">
    <header>
      <input v-model="name" class="py-2 flex-1 w-full" />
      <LoadoutStats :loadout="cards" />
      {{ minionsCount }} / {{ config.MAX_DECK_SIZE }}
    </header>

    <ul v-if="cards.length" v-auto-animate class="flex-1 fancy-scrollbar">
      <li
        v-for="card in groupedUnits"
        :key="card.card.id"
        :class="card.card.kind.toLowerCase()"
        @click="emit('remove', card.card)"
      >
        <div class="cost">
          {{ card.card.cost }}
        </div>

        <div class="name">
          {{ card.card.name }}
          <template v-if="card.copies > 1">X {{ card.copies }}</template>
        </div>

        <div class="flex items-center ml-auto" style="aspect-ratio: 1; width: 64px">
          <UiIconButton
            v-if="card.card.kind === 'MINION' || card.card.kind === 'GENERAL'"
            name="ph:caret-left-fill"
            class="pedestal-nav"
            type="button"
            @click.stop="changePedestal(card.id, -1)"
          />
          <div class="sprite mx-auto">
            <CardSprite
              :sprite-id="card.card.spriteId"
              :pedestal-id="
                card.card.kind === 'MINION' || card.card.kind === 'GENERAL'
                  ? card.pedestalId
                  : undefined
              "
            />
          </div>
          <UiIconButton
            v-if="card.card.kind === 'MINION' || card.card.kind === 'GENERAL'"
            name="ph:caret-right-fill"
            class="pedestal-nav"
            type="button"
            @click.stop="changePedestal(card.id, 1)"
          />
        </div>
      </li>
    </ul>

    <p v-else class="my-8 text-center">
      Click units on the left to add them to your deck.
    </p>

    <footer class="mt-auto">
      <UiButton
        class="ghost-button"
        left-icon="mdi:undo"
        type="button"
        :is-loading="isSaving"
        @click="emit('back')"
      >
        Back
      </UiButton>
      <UiFancyButton :is-loading="isSaving">Save</UiFancyButton>
    </footer>
  </form>
</template>

<style scoped lang="postcss">
form {
  display: grid;
  grid-template-rows: auto 1fr auto;

  height: 100%;
  padding-top: var(--size-2);
  padding-left: var(--size-3);
  > * {
    padding-right: var(--size-3);
  }
}

header {
  /* display: flex;
  gap: var(--size-3);
  align-items: center;
  justify-content: space-between; */
  input {
    font-size: var(--font-size-2);
    font-weight: var(--font-weight-5);
  }
}

ul {
  overflow-y: auto;
}

footer {
  display: flex;
  gap: var(--size-3);
  justify-content: flex-end;
  padding-block: var(--size-3);
}

li {
  cursor: pointer;
  user-select: none;

  overflow: hidden;
  display: flex;
  gap: var(--size-2);
  align-items: center;

  height: 88px;
  padding-block: var(--size-2);

  font-size: var(--font-size-3);

  border-bottom: solid var(--border-size-1) var(--border-dimmed);

  &:hover {
    filter: brightness(120%);
  }
  &.general .cost {
    visibility: hidden;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > .rune {
    width: 18px;
    height: 20px;
  }

  > button {
    padding: var(--size-1);
    font-size: var(--font-size-0);
    border-radius: var(--radius-round);
    box-shadow: inset 0 0 3px 4px rgba(0, 0, 0, 0.35);
  }
}

.cost {
  display: grid;
  place-content: center;

  width: var(--size-6);
  height: var(--size-6);
  padding: var(--size-1);

  color: white;

  background-color: var(--blue-9);
  border-radius: var(--radius-round);
}

.rune {
  width: 11px;
  height: 13px;
  image-rendering: pixelated;
}

.sprite {
  transform: translateY(24px);
}

.pedestal-nav {
  --ui-button-hover-bg: var(--gray-9);
  --ui-button-focus-bg: var(--gray-9);
  --ui-button-hover-color: var(--primary);
  --ui-button-focus-color: var(--primary);

  z-index: 1;
  transform: translateY(16px);
  margin-top: var(--size-5);
}

.name {
  /* overflow: hidden; */

  width: 13ch;
  margin-top: var(--size-2);
  font-size: var(--font-size-0);
  line-height: 1;
  /* text-align: center; */
  /* text-overflow: ellipsis; */
  /* white-space: nowrap; */
}
</style>

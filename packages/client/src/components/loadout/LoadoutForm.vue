<script setup lang="ts">
import { config, CARD_KINDS, CARDS, type CardBlueprint } from '@game/sdk';

const { isSaving, cards } = defineProps<{
  cards: Array<{ id: string; pedestalId: string }>;
  isSaving: boolean;
}>();

const emit = defineEmits<{
  save: [];
  toggleUnit: [CardBlueprint];
  setPedestal: [{ id: string; pedestalId: string }];
  back: [];
}>();

const name = defineModel<string>('name', { required: true });

const sortedUnits = computed(() => {
  return cards
    .map(card => ({ ...card, card: CARDS[card.id] }))
    .sort((a, b) => {
      if (a.card.kind === CARD_KINDS.GENERAL) return -1;
      if (b.card.kind === CARD_KINDS.GENERAL) return 1;
      return a.card.cost - b.card.cost;
    });
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
      <input v-model="name" class="py-3 flex-1" />
      {{ minionsCount }} / {{ config.MAX_DECK_SIZE }}
    </header>

    <ul v-if="cards.length" v-auto-animate class="flex-1">
      <li
        v-for="card in sortedUnits"
        :key="card.card.id"
        :class="card.card.kind.toLowerCase()"
      >
        <div class="cost">
          {{ card.card.cost }}
        </div>

        <div>
          <div class="flex gap-2">
            <img
              v-for="(_, index) in 3"
              :key="index"
              :src="`/assets/ui/rune-${
                card.card.factions[index]?.id.toLocaleLowerCase() ?? 'empty'
              }.png`"
              class="rune"
            />
          </div>
          <div class="name">{{ card.card.name }}</div>
        </div>

        <div class="flex items-center ml-auto">
          <UiIconButton
            name="ph:caret-left-fill"
            class="pedestal-nav"
            type="button"
            @click="changePedestal(card.id, -1)"
          />
          <div class="sprite mx-auto">
            <CardSprite :sprite-id="card.card.spriteId" :pedestal-id="card.pedestalId" />
          </div>
          <UiIconButton
            name="ph:caret-right-fill"
            class="pedestal-nav"
            type="button"
            @click="changePedestal(card.id, 1)"
          />
        </div>

        <UiIconButton
          name="mdi:minus"
          aria-label="remove from loadout"
          class="error-button"
          type="button"
          @click="emit('toggleUnit', card.card)"
        />
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
  display: flex;
  flex-direction: column;

  height: 100%;
  padding-top: var(--size-5);
  padding-right: var(--size-3);
  padding-left: var(--size-3);
}

header {
  display: flex;
  gap: var(--size-3);
  align-items: center;
  justify-content: space-between;
}

footer {
  display: flex;
  gap: var(--size-3);
  justify-content: flex-end;
  padding-block: var(--size-3);
}

li {
  overflow: hidden;
  display: flex;
  gap: var(--size-2);
  align-items: center;

  height: 88px;
  padding-block: var(--size-2);

  font-size: var(--font-size-3);

  border-bottom: solid var(--border-size-1) var(--border-dimmed);
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
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  > * {
    grid-column: 1 / -1;
    grid-row: 1 / -1;
  }
}

.pedestal-nav {
  --ui-button-hover-bg: var(--gray-9);
  --ui-button-focus-bg: var(--gray-9);
  --ui-button-hover-color: var(--primary);
  --ui-button-focus-color: var(--primary);

  margin-top: var(--size-5);
}

.name {
  overflow: hidden;

  width: 13ch;
  margin-top: var(--size-2);

  font-size: var(--font-size-0);
  line-height: 1;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

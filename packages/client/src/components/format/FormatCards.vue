<script setup lang="ts">
import {
  CARD_KINDS,
  CARDS,
  RARITIES,
  type GameSessionConfig,
  type GenericSerializedBlueprint
} from '@game/sdk';
import type { Nullable } from '@game/shared';
import { nanoid } from 'nanoid';

const format = defineModel<{
  cards: Record<string, GenericSerializedBlueprint>;
  config: GameSessionConfig;
}>('format', { required: true });

const customCards = computed(() =>
  Object.values(format.value.cards).filter(card => !CARDS[card.id])
);

const editedCards = computed(() =>
  Object.values(format.value.cards).filter(card => !!CARDS[card.id])
);
const isEdited = (card: GenericSerializedBlueprint) =>
  editedCards.value.some(c => c.id === card.id);

const standardCards = computed(() => Object.values(CARDS));

const isCardsModalOpened = ref(false);
const selectedCardId = ref<Nullable<string>>(null);
const selectedCard = computed(() => {
  if (!selectedCardId.value) return null;
  return format.value.cards[selectedCardId.value];
});
const addCard = (card: GenericSerializedBlueprint) => {
  format.value.cards[card.id] = structuredClone(card);
  selectedCardId.value = card.id;
};

const search = ref('');
const filteredCards = computed(() =>
  standardCards.value.filter(c =>
    c.name.toLowerCase().includes(search.value.toLocaleLowerCase())
  )
);
</script>

<template>
  <div class="format-cards">
    <section>
      <h3>Custom Cards</h3>
      <p>These are your brand new cards.</p>
      <p v-if="!customCards.length" class="my-2 italic">
        This format doesn't have any custom card
      </p>
      <ul v-else class="card-list fancy-scrollbar">
        <li v-for="card in customCards" :key="card.id">
          <UiButton
            type="button"
            class="ghost-button"
            :class="card.id === selectedCardId && 'selected'"
            @click="selectedCardId = card.id"
          >
            <CardSprite :sprite-id="card.spriteId" class="sprite" />
            {{ card.name }}
          </UiButton>
        </li>
      </ul>
      <div class="flex items-center gap-2">
        <UiButton
          type="button"
          class="primary-button"
          is-inline
          left-icon="material-symbols:add"
          @click="
            () => {
              const id = nanoid(6);
              format.cards[id] = {
                id,
                name: '',
                collectable: true,
                keywords: [],
                relatedBlueprintIds: [],
                tags: [],
                kind: CARD_KINDS.MINION,
                rarity: RARITIES.COMMON,
                effects: [],
                targets: { min: 0, targets: [] },
                cellHighlights: []
              } as any;
              selectedCardId = id;
            }
          "
        >
          Make New Card
        </UiButton>
      </div>

      <h3 class="mt-4">Edited Cards</h3>
      <p>These are altered version of standard cards</p>
      <p v-if="!editedCards.length" class="my-2 italic">
        This format doesn't have any edited card
      </p>

      <ul v-else class="card-list fancy-scrollbar">
        <li v-for="card in editedCards" :key="card.id" class="flex gap-2">
          <UiButton
            class="ghost-button"
            :class="card.id === selectedCardId && 'selected'"
            @click="selectedCardId = card.id"
          >
            <CardSprite :sprite-id="card.spriteId" class="sprite" />
            {{ card.name }}
          </UiButton>

          <UiIconButton
            name="material-symbols:delete-outline"
            class="ghost-error-button shrink-0"
            @click="delete format.cards[card.id]"
          />
        </li>
      </ul>
      <UiButton
        type="button"
        class="primary-button"
        is-inline
        left-icon="material-symbols:add"
        @click="isCardsModalOpened = true"
      >
        Edit Card
      </UiButton>

      <UiModal v-model:is-opened="isCardsModalOpened" title="Select a card">
        <UiTextInput
          id="card-search"
          v-model="search"
          placeholder="Search for a card"
          left-icon="material-symbols:search"
          class="mb-4"
        />
        <ul class="card-list fancy-scrollbar">
          <li v-for="card in filteredCards" :key="card.id">
            <UiButton
              type="button"
              class="ghost-button"
              :disabled="isEdited(card)"
              @click="
                () => {
                  addCard(card);
                  isCardsModalOpened = false;
                }
              "
            >
              <CardSprite :sprite-id="card.spriteId" class="sprite" />
              {{ card.name }}
            </UiButton>
          </li>
        </ul>
        <footer class="flex justify-end">
          <UiButton class="error-button" @click="isCardsModalOpened = false">
            Cancel
          </UiButton>
        </footer>
      </UiModal>
    </section>

    <section>
      <p v-if="!selectedCard">Select a card on the left panel</p>

      <CardBuilder
        v-else
        v-model:card="selectedCard"
        :format="format"
        :is-custom-card="!isEdited(selectedCard)"
      />
    </section>
  </div>
</template>

<style scoped lang="postcss">
.format-cards {
  display: grid;
  grid-template-columns: var(--size-xs) 1fr;
  gap: var(--size-6);
  height: 100%;
}

h3 {
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-5);
}

section {
  overflow: hidden;
  height: 100%;
  padding-inline: var(--size-2);
}

.card-list {
  overflow-y: auto;
  display: grid;
  gap: var(--size-2);

  max-height: var(--size-xs);
  padding: var(--size-2);

  .selected {
    --ui-button-border-color: var(--border);
    --ui-button-border-size: var(--border-size-1);
    --ui-button-bg: hsl(0 0 100% / 0.05);
  }
}

.sprite {
  aspect-ratio: 1;
  width: 64px;
}
</style>

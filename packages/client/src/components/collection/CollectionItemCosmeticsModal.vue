<script setup lang="ts">
import { CARD_KINDS, type CardBlueprint } from '@game/sdk';
import type { Nullable } from '@game/shared';

const { card } = defineProps<{
  card: Nullable<{
    card: CardBlueprint;
    pedestalId: string;
    cardBackId: string;
  }>;
  isLoading: boolean;
}>();

const emit = defineEmits<{ submit: [{ pedestalId: string; cardBackId: string }] }>();

const isOpened = defineModel<boolean>('isOpened', { required: true });

// TODO load user owned cosmetics from api
const pedestals = [
  'pedestal-default',
  'pedestal-stone',
  'pedestal-grass',
  'pedestal-ocean',
  'pedestal-cyber',
  'pedestal-lava',
  'pedestal-sand',
  'pedestal-lyonar',
  'pedestal-songhai',
  'pedestal-vetruvian',
  'pedestal-abyssian',
  'pedestal-magmar',
  'pedestal-vanar'
];

const cardBacks = [
  'default',
  'fire',
  'clouds',
  'wood',
  'lyonar',
  'vetruvian',
  'magmar',
  'vanar'
];

const isUnit = computed(
  () =>
    card &&
    (card.card.kind === CARD_KINDS.GENERAL || card.card.kind === CARD_KINDS.MINION)
);

const selectedPedestal = ref(card?.pedestalId);
const selectedCardBack = ref(card?.cardBackId);

watchEffect(() => {
  selectedCardBack.value = card?.cardBackId;
  selectedPedestal.value = card?.pedestalId;
});
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    :style="{ '--ui-modal-size': 'var(--size-lg)' }"
    title="Card cosmetics"
  >
    <div class="cosmetics-modal">
      <div
        @contextmenu="
          e => {
            e.preventDefault();
          }
        "
      >
        <Card
          v-if="card && selectedCardBack && selectedPedestal"
          :card="{
            blueprintId: card.card.id,
            name: card.card.name,
            description: card.card.description,
            kind: card.card.kind,
            spriteId: card.card.spriteId,
            rarity: card.card.rarity,
            attack: card.card.attack,
            hp: card.card.maxHp,
            speed: card.card.speed,
            cost: card.card.cost,
            faction: card.card.faction,
            keywords: [],
            tags: card.card.tags ?? [],
            cardbackId: selectedCardBack,
            pedestalId: selectedPedestal
          }"
        />
      </div>

      <div class="options">
        <template v-if="isUnit">
          <h3>Pedestal</h3>
          <ul class="pedestals fancy-scrollbar">
            <li
              v-for="pedestal in pedestals"
              :key="pedestal"
              :class="selectedPedestal === pedestal && 'selected'"
            >
              <label>
                <PedestalSprite :pedestal-id="pedestal" />
                <input
                  v-model="selectedPedestal"
                  type="radio"
                  :value="pedestal"
                  class="sr-only"
                />
              </label>
            </li>
          </ul>
        </template>

        <h3>Card backgrounds</h3>
        <ul class="card-backs fancy-scrollbar">
          <li
            v-for="cardBack in cardBacks"
            :key="cardBack"
            :class="selectedCardBack === cardBack && 'selected'"
          >
            <label>
              <img :src="`/assets/ui/card-back-${cardBack}.png`" />

              <input
                v-model="selectedCardBack"
                type="radio"
                :value="cardBack"
                class="sr-only"
              />
            </label>
          </li>
        </ul>
      </div>
    </div>
    <footer class="flex justify-end gap-3">
      <UiButton class="ghost-button" @click="isOpened = false">Cancel</UiButton>
      <UiButton
        class="primary-button"
        :disabled="isLoading"
        @click="
          emit('submit', { pedestalId: selectedPedestal!, cardBackId: selectedCardBack! })
        "
      >
        Save
      </UiButton>
    </footer>
  </UiModal>
</template>

<style scoped lang="postcss">
.cosmetics-modal {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

h3 {
  margin-bottom: var(--size-3);
}
ul {
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-2);

  max-height: 15rem;
}

li {
  &.hover {
    background-color: hsl(var(--color-primary-hsl) / 0.25);
  }
  &.selected {
    border: solid var(--border-size-2) var(--border);
  }
}

.pedestals {
  > li > label > div {
    cursor: pointer;
    width: 72px;
    height: 84px;
    border-radius: var(--radius-2);
  }
}

.card-backs {
  img {
    cursor: pointer;
    width: 143px;
    height: 210px;
    &.hover {
      background-color: hsl(var(--color-primary-hsl) / 0.25);
    }
    &.selected {
      border: solid var(--border-size-2) var(--border);
    }
  }
}
</style>

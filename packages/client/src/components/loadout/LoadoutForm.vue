<script setup lang="ts">
import { CARD_KINDS, CARDS, type CardBlueprint, type CardKind } from '@game/sdk';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';
import type { Nullable } from '@game/shared';
import { uniqBy } from 'lodash-es';

const emit = defineEmits<{
  back: [];
}>();

const { formValues, save, isSaving, removeCard } = useLoadoutForm();

const groupedUnits = computed(() => {
  const copies: Record<string, number> = {};
  formValues.value.cards.forEach(card => {
    if (!copies[card.id]) {
      copies[card.id] = 1;
    } else {
      copies[card.id]++;
    }
  });

  return uniqBy(
    formValues.value.cards
      .map(card => ({
        ...card,
        card: parseSerializeBlueprint(CARDS[card.id]),
        copies: copies[card.id]
      }))
      .sort((a, b) => {
        if (a.card.kind === CARD_KINDS.GENERAL) return -1;
        if (b.card.kind === CARD_KINDS.GENERAL) return 1;
        return a.card.cost - b.card.cost;
      }),
    'id'
  );
});

const getCountByKind = (kind: CardKind) => {
  return formValues.value.cards.filter(c => CARDS[c.id].kind === kind).length;
};

const cardsCount = computed(() => {
  return formValues.value.cards.filter(c => CARDS[c.id].kind !== CARD_KINDS.GENERAL)
    .length;
});

const selectedCard =
  ref<Nullable<{ card: CardBlueprint; pedestalId: string; cardBackId: string }>>();

const updateCosmetics = ({
  pedestalId,
  cardBackId
}: {
  pedestalId: string;
  cardBackId: string;
}) => {
  const id = selectedCard.value?.card.id;
  if (!id) return;
  formValues.value.cards.forEach(card => {
    if (card.id === id) {
      card.cardBackId = cardBackId;
      card.pedestalId = pedestalId;
    }
  });
  selectedCard.value = null;
};
</script>

<template>
  <form @submit.prevent="save">
    <header>
      <input v-model="formValues.name" class="py-2 flex-1 w-full" />
      <LoadoutStats :loadout="formValues.cards" />
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
          Minions
        </div>
      </div>
    </header>

    <ul v-if="formValues.cards.length" v-auto-animate class="flex-1 fancy-scrollbar">
      <HoverCardRoot
        v-for="card in groupedUnits"
        :key="card.card.id"
        :open-delay="0"
        :close-delay="0"
      >
        <HoverCardTrigger as-child>
          <li :class="card.card.kind.toLowerCase()" @click="removeCard(card.card.id)">
            <div class="cost">
              {{ card.card.cost }}
            </div>

            <div class="name">
              <template v-if="card.copies > 1">X {{ card.copies }}</template>
              {{ card.card.name }}
            </div>

            <div class="flex items-center ml-auto" style="aspect-ratio: 1; width: 64px">
              <div class="sprite mx-auto">
                <CardSprite :sprite-id="card.card.spriteId" />
              </div>
            </div>
          </li>
        </HoverCardTrigger>

        <HoverCardPortal>
          <HoverCardContent :side-offset="5" side="left" align="center" class="relative">
            <Card
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
                tags: card.card.tags ?? [],
                pedestalId: card.pedestalId,
                cardbackId: card.cardBackId
              }"
            />
            <UiIconButton
              class="ghost-button cosmetics-toggle"
              name="mdi:palette"
              @click="
                selectedCard = {
                  card: card.card,
                  pedestalId: card.pedestalId,
                  cardBackId: card.cardBackId
                }
              "
            />
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
    </ul>

    <p v-else class="my-8 text-center">
      Click units on the left to add them to your deck.
    </p>

    <CollectionItemCosmeticsModal
      :is-opened="!!selectedCard"
      :card="selectedCard!"
      :is-loading="false"
      @update:is-opened="selectedCard = null"
      @submit="updateCosmetics($event)"
    />

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
  transform: translateY(4px);

  display: grid;
  place-content: center;

  width: var(--size-7);
  height: var(--size-7);
  padding: var(--size-1);

  font-size: var(--font-size-1);
  color: black;

  background-image: url('/assets/ui/card-cost.png');
  background-size: cover;
  /* background-color: var(--blue-9);
  border-radius: var(--radius-round); */
}

.sprite {
  transform: translateY(24px);
}

.name {
  overflow: hidden;
  display: grid;
  align-items: center;
  align-self: stretch;

  margin-top: var(--size-2);

  font-size: var(--font-size-1);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.counts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  font-size: var(--font-size-0);
  > div > span {
    font-size: var(--font-size-2);
    color: var(--primary);
  }
}

.cosmetics-toggle {
  --ui-icon-button-size: var(--size-7);

  position: absolute;
  right: 0;
  bottom: calc(-1 * var(--size-3));
}
</style>

<script setup lang="ts">
import type { GameFormatDto } from '@game/api/src/convex/formats/format.mapper';
import {
  CARD_KINDS,
  CARDS,
  defaultMap,
  GameSession,
  type CardBlueprint,
  type CardKind,
  type LoadoutViolation
} from '@game/sdk';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';
import type { Nullable } from '@game/shared';
import { uniqBy } from 'lodash-es';

const emit = defineEmits<{
  back: [];
}>();

const { format } = defineProps<{ format: Pick<GameFormatDto, 'cards' | 'config'> }>();
const { formValues, save, isSaving } = useLoadoutForm();

const groupedCards = computed(() => {
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
        if (a.card.cost === b.card.cost) return a.card.name.localeCompare(b.card.name);
        return a.card.cost - b.card.cost;
      }),
    'id'
  );
});

const getCountByKind = (kind: CardKind) => {
  return formValues.value.cards.filter(c => CARDS[c.id].kind === kind).length;
};

const cardsCount = computed(() => {
  return formValues.value.cards.length;
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

const flashingCards = ref(new Set<string>());
watch(groupedCards, (newGroups, oldGroups) => {
  newGroups.forEach(group => {
    const old = oldGroups.find(g => g.card.id === group.card.id);
    if (!old) {
      flashingCards.value.add(group.id);
      return;
    }

    if (old.copies !== group.copies) {
      flashingCards.value.add(group.id);
    }
  });
});

const importCode = ref('');
const { copy } = useClipboard();

const exportCode = () => {
  const json = JSON.stringify(formValues.value.cards.map(c => c.id));
  const code = `${formValues.value.name}|${btoa(json)}`;
  copy(code);
  importCode.value = code;
};

const isDetailModalOpened = ref(false);

const violations = computed(() => {
  return GameSession.getLoadoutViolations(
    formValues.value.cards.map(c => ({ ...c, blueprintId: c.id })),
    {
      ...format,
      map: defaultMap
    }
  );
});
const hasViolation = (type: LoadoutViolation['type']) =>
  violations.value.some(v => v.type === type);
</script>

<template>
  <form @submit.prevent="save">
    <header>
      <div class="flex">
        <PopoverRoot>
          <PopoverTrigger as-child>
            <UiIconButton
              type="button"
              name="mdi:dots-vertical"
              class="ghost-button menu-toggle"
              :style="{ '--ui-icon-button-radius': 'var(--radius-2)' }"
            />
          </PopoverTrigger>
          <PopoverPortal>
            <PopoverContent as-child side="left" algn="end">
              <div class="fancy-surface">
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
                    Total
                  </div>
                </div>
                <div class="flex">
                  <UiButton
                    class="ghost-button"
                    left-icon="ri:share-forward-fill"
                    @click="isDetailModalOpened = true"
                  >
                    Share
                  </UiButton>
                  <LoadoutModal
                    v-model:is-opened="isDetailModalOpened"
                    :loadout="formValues"
                  />
                  <UiButton
                    class="ghost-button"
                    left-icon="material-symbols:content-copy-outline-rounded"
                    @click="exportCode"
                  >
                    Export code
                  </UiButton>
                </div>
              </div>
            </PopoverContent>
          </PopoverPortal>
          <UiTextInput
            id="loadout-name"
            v-model="formValues.name"
            class="flex-1 w-full"
          />
        </PopoverRoot>
      </div>
      <div class="flex my-3 pl-3">
        <HoverCardRoot v-if="violations.length" :open-delay="0" :close-delay="0">
          <HoverCardTrigger class="c-error">
            <Icon name="material-symbols:warning" />
            Invalid deck
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent as="ul" class="fancy-surface">
              <li v-for="(violation, index) in violations" :key="index">
                {{ violation.message }}
              </li>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCardRoot>
        <span class="ml-auto" :class="hasViolation('too_big') && 'c-error'">
          {{ formValues.cards.length }}
        </span>
        / {{ format.config.MAX_DECK_SIZE }}
        <Icon name="mdi:cards" class="text-4" />
      </div>
    </header>

    <ul v-if="formValues.cards.length" class="flex-1 fancy-scrollbar">
      <LoadoutFormItem
        v-for="group in groupedCards"
        :key="group.card.id"
        :group="group"
        :is-flashing="flashingCards.has(group.id)"
        @flash:end="flashingCards.delete(group.id)"
        @select="
          selectedCard = {
            card: group.card,
            cardBackId: group.cardBackId,
            pedestalId: group.pedestalId
          }
        "
      />
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

    <footer>
      <div class="flex justify-end gap-3">
        <UiButton
          class="ghost-button"
          left-icon="mdi:undo"
          type="button"
          :is-loading="isSaving"
          @click="emit('back')"
        >
          Back
        </UiButton>
        <UiButton class="primary-button" :is-loading="isSaving">Save</UiButton>
      </div>
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
  margin-block-start: auto;
  padding-block: var(--size-3);

  @screen lt-lg {
    padding-block: var(--size-1);
  }
}

.export {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--size-1);
  margin-block-start: var(--size-2);

  @screen lt-lg {
    display: none;
  }
}

.counts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--size-2);
  justify-items: center;

  font-size: var(--font-size-0);
  > div > span {
    font-size: var(--font-size-2);
    color: var(--primary);
  }
}

.menu-toggle {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>

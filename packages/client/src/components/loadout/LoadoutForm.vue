<script setup lang="ts">
import { CARD_KINDS, CARDS, type CardBlueprint, type CardKind } from '@game/sdk';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';
import type { Nullable } from '@game/shared';
import { uniqBy } from 'lodash-es';

const emit = defineEmits<{
  back: [];
  importCode: [code: string];
}>();

const { formValues, save, isSaving, removeCard } = useLoadoutForm();

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
          Total
        </div>
      </div>
    </header>

    <ul v-if="formValues.cards.length" class="flex-1 fancy-scrollbar">
      <HoverCardRoot
        v-for="group in groupedCards"
        :key="group.card.id"
        :open-delay="0"
        :close-delay="0"
      >
        <HoverCardTrigger as-child>
          <li
            :class="[
              group.card.kind.toLowerCase(),
              flashingCards.has(group.id) && 'flash'
            ]"
            @click="removeCard(group.card.id)"
            @animationend="flashingCards.delete(group.id)"
          >
            <div class="cost">
              {{ group.card.cost }}
            </div>

            <div class="name">
              <template v-if="group.copies > 1">X {{ group.copies }}</template>
              {{ group.card.name }}
            </div>

            <div class="flex items-center ml-auto" style="aspect-ratio: 1; width: 64px">
              <div class="sprite mx-auto">
                <CardSprite :sprite-id="group.card.spriteId" />
              </div>
            </div>
          </li>
        </HoverCardTrigger>

        <HoverCardPortal>
          <HoverCardContent :side-offset="5" side="left" align="center" class="relative">
            <Card
              :card="{
                blueprintId: group.card.id,
                name: group.card.name,
                description: group.card.description,
                kind: group.card.kind,
                spriteId: group.card.spriteId,
                rarity: group.card.rarity,
                attack: group.card.attack,
                hp: group.card.maxHp,
                speed: group.card.speed,
                cost: group.card.cost,
                faction: group.card.faction,
                tags: group.card.tags ?? [],
                pedestalId: group.pedestalId,
                cardbackId: group.cardBackId
              }"
            />
            <UiIconButton
              class="ghost-button cosmetics-toggle"
              name="mdi:palette"
              @click="
                selectedCard = {
                  card: group.card,
                  pedestalId: group.pedestalId,
                  cardBackId: group.cardBackId
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
        <UiFancyButton :is-loading="isSaving">Save</UiFancyButton>
      </div>
      <div class="export">
        <UiTextInput id="import-code" v-model="importCode" placeholder="Import deck" />
        <UiIconButton
          class="subtle-button"
          name="solar:import-linear"
          type="button"
          @click="emit('importCode', importCode)"
        />
        <UiIconButton
          class="subtle-button"
          name="material-symbols:content-copy-outline-rounded"
          type="button"
          @click="exportCode"
        />
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
  padding-block: var(--size-3);
}

@keyframes loadout-card-flash {
  50% {
    transform: scale(1.03);
    filter: brightness(200%) drop-shadow(0 0 6px white);
  }
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

  &.flash {
    animation: loadout-card-flash 0.3s;
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

.export {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--size-1);
  margin-block-start: var(--size-2);
}
</style>

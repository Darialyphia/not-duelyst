import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import type { GameFormat } from '@game/api/src/convex/formats/format.entity';
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import { CARD_KINDS, CARDS, defaultConfig } from '@game/sdk';
import type { CardBlueprintId } from '@game/sdk/src/card/card';
import { match } from 'ts-pattern';

export const useLoadoutForm = ({
  defaultName,
  onSuccess
}: {
  defaultName: MaybeRefOrGetter<string>;
  onSuccess: () => void;
}) => {
  const format: GameFormat = {
    config: defaultConfig
  };

  const formValues = ref<{
    loadoutId?: Id<'loadouts'>;
    name: string;
    cards: Array<{ id: string; pedestalId: string }>;
  }>();

  const general = computed(() => {
    const card = formValues.value?.cards.find(c => {
      const card = CARDS[c.id];
      return card.kind === CARD_KINDS.GENERAL;
    });
    if (!card) return null;
    return CARDS[card.id];
  });

  const initEmpty = () => {
    formValues.value = {
      cards: [],
      name: toValue(defaultName)
    };
  };

  const initFromLoadout = (loadout: LoadoutDto) => {
    formValues.value = {
      loadoutId: loadout._id,
      cards: loadout.cards,
      name: loadout.name
    };
  };

  const loadoutIsFull = computed(
    () => formValues.value!.cards.length >= format.config.MAX_DECK_SIZE + 1 // account for general
  );

  const canAddCard = (cardId: CardBlueprintId) => {
    const card = CARDS[cardId];

    if (!formValues.value) return false;
    if (loadoutIsFull.value) return false;
    return match(card.kind)
      .with(CARD_KINDS.GENERAL, () => {
        if (!general.value) return true;
        return general.value.faction === card.faction;
      })
      .otherwise(
        () =>
          formValues.value!.cards.filter(c => c.id === cardId).length <
          format.config.MAX_COPIES_PER_CARD
      );
  };

  const isInLoadout = (cardId: CardBlueprintId) => {
    return formValues.value?.cards.some(card => card.id === cardId);
  };

  const addCard = (cardId: CardBlueprintId) => {
    if (!formValues.value) return;
    const card = CARDS[cardId];
    if (card.kind === CARD_KINDS.GENERAL && general.value) {
      formValues.value.cards.find(c => c.id === cardId)!.id = cardId;
      return;
    }
    formValues.value.cards.push({ id: cardId, pedestalId: 'pedestal-default' });
  };

  const removeCard = (cardId: CardBlueprintId) => {
    if (!formValues.value) return;
    const index = formValues.value.cards.findIndex(card => card.id === cardId);
    formValues.value.cards.splice(index, 1);
  };

  const { mutate: saveNewDeck, isLoading: isSavingNewDeck } = useConvexAuthedMutation(
    api.loadout.create,
    {
      onSuccess
    }
  );
  const { mutate: updateDeck, isLoading: isUpdatingDeck } = useConvexAuthedMutation(
    api.loadout.update,
    {
      onSuccess
    }
  );

  const isSaving = computed(() => isSavingNewDeck.value || isUpdatingDeck.value);

  const save = () => {
    if (!formValues.value) return;
    if (formValues.value.loadoutId) {
      updateDeck({
        loadoutId: formValues.value.loadoutId,
        ...formValues.value
      });
    } else {
      saveNewDeck(formValues.value);
    }
  };

  return {
    formValues,
    general,
    initEmpty,
    initFromLoadout,
    canAddCard,
    isInLoadout,
    loadoutIsFull,
    addCard,
    removeCard,
    save,
    isSaving
  };
};

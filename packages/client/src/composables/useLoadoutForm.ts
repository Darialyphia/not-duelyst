import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import { CARD_KINDS, CARDS, config } from '@game/sdk';
import type { Card, CardBlueprintId } from '@game/sdk/src/card/card';
import { match } from 'ts-pattern';

export const useLoadoutForm = ({
  defaultName,
  onSuccess
}: {
  defaultName: MaybeRefOrGetter<string>;
  onSuccess: () => void;
}) => {
  const formValues = ref<{
    loadoutId?: Id<'loadouts'>;
    name: string;
    cards: Array<{ id: string; pedestalId: string }>;
  }>();

  const general = computed(() => {
    return formValues.value?.cards.find(c => {
      const card = CARDS[c.id];
      return card.kind === CARD_KINDS.GENERAL;
    });
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
    () => formValues.value!.cards.length >= config.MAX_HAND_SIZE
  );

  const canAddUnit = (cardId: CardBlueprintId) => {
    const card = CARDS[cardId];

    if (!formValues.value) return false;
    return match(card.kind)
      .with(CARD_KINDS.GENERAL, () => !general.value)
      .with(
        CARD_KINDS.MINION,
        () => !!general.value && formValues.value!.cards.every(card => card.id !== cardId)
      )
      .exhaustive();
  };

  const isInLoadout = (cardId: CardBlueprintId) => {
    return formValues.value?.cards.some(card => card.id === cardId);
  };

  const toggleUnit = (cardId: CardBlueprintId) => {
    if (!formValues.value) return;

    const index = formValues.value.cards.findIndex(card => card.id === cardId);
    if (index > 0) {
      formValues.value.cards.splice(index, 1);
    } else {
      formValues.value.cards.push({ id: cardId, pedestalId: 'pedestal-default' });
    }
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
    canAddUnit,
    isInLoadout,
    loadoutIsFull,
    toggleUnit,
    save,
    isSaving
  };
};

import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import type { GameFormat } from '@game/api/src/convex/formats/format.entity';
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import { CARD_KINDS, CARDS, defaultConfig, type CardBlueprint } from '@game/sdk';
import type { CardBlueprintId } from '@game/sdk/src/card/card';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';
import { match } from 'ts-pattern';
import type { InjectionKey } from 'vue';

type LodoutFormContext = {
  formValues: Ref<{
    loadoutId?: Id<'loadouts'>;
    name: string;
    cards: Array<{
      id: string;
      pedestalId: string;
      cardBackId: string;
    }>;
  }>;
  general: ComputedRef<CardBlueprint | null>;
  initEmpty(): void;
  initFromLoadout(loadout: LoadoutDto): void;
  canAddCard(cardId: CardBlueprintId): boolean;
  isInLoadout(cardId: CardBlueprintId): boolean;
  loadoutIsFull: ComputedRef<boolean>;
  addCard(card: { id: string; pedestalId: string; cardBackId: string }): void;
  removeCard(cardId: CardBlueprintId): void;
  save: () => void;
  isSaving: ComputedRef<boolean>;
};
export const LOADOUT_FORM_INJECTION_KEY = Symbol(
  'Loadout form'
) as InjectionKey<LodoutFormContext>;

export const useLoadoutFormProvider = ({
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
    cards: Array<{ id: string; pedestalId: string; cardBackId: string }>;
  }>({ name: '', cards: [] });

  const general = computed(() => {
    const card = formValues.value?.cards.find(c => {
      const card = CARDS[c.id];
      return card.kind === CARD_KINDS.GENERAL;
    });
    if (!card) return null;
    return parseSerializeBlueprint(CARDS[card.id]);
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
    return formValues.value?.cards.some(card => card.id === cardId) ?? false;
  };

  const addCard = ({
    id,
    cardBackId,
    pedestalId
  }: {
    id: string;
    pedestalId: string;
    cardBackId: string;
  }) => {
    if (!formValues.value) return;
    const card = CARDS[id];
    if (card.kind === CARD_KINDS.GENERAL && general.value) {
      formValues.value.cards.find(c => c.id === id)!.id = id;
      return;
    }
    formValues.value.cards.push({ id, pedestalId, cardBackId });
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

  const ctx: LodoutFormContext = {
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

  provide(LOADOUT_FORM_INJECTION_KEY, ctx);

  return ctx;
};

export const useLoadoutForm = () => useSafeInject(LOADOUT_FORM_INJECTION_KEY);

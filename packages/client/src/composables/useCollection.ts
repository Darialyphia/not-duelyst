import { api } from '@game/api';
import type { CollectionItemDto } from '@game/api/src/convex/collection/collection.utils';
import { CARD_KINDS, CARDS, FACTIONS } from '@game/sdk';
import type { CardBlueprint } from '@game/sdk/src/card/card-blueprint';

export const useCollection = () => {
  const { data: collection, isLoading: isCollectionLoading } = useConvexAuthedQuery(
    api.collection.myCollection,
    {}
  );

  const factions = Object.values(FACTIONS).map(f => f.id);

  const factionFilter = ref<string[]>([]);

  const allCards = computed(() =>
    collection.value.map(item => {
      return { ...item, card: CARDS[item.cardId] };
    })
  );

  type CollectionItemWithCard = CollectionItemDto & { card: CardBlueprint };

  const sortUnitFunction = (a: CollectionItemWithCard, b: CollectionItemWithCard) => {
    if (a.card.kind === CARD_KINDS.GENERAL && b.card.kind === CARD_KINDS.MINION)
      return -1;
    if (b.card.kind === CARD_KINDS.GENERAL && a.card.kind === CARD_KINDS.MINION) return 1;
    const aFaction = a.card.factions[0];
    const bFaction = b.card.factions[0];

    const factionDiff =
      factions.indexOf(bFaction?.id as string) - factions.indexOf(aFaction?.id as string);
    if (factionDiff !== 0) return factionDiff * -1;

    return a.card.cost - b.card.cost;
  };

  const displayedCards = computed(() => {
    if (!collection.value) return [];
    if (!factionFilter.value.length) return allCards.value.sort(sortUnitFunction);

    return allCards.value
      .filter(({ card }) => {
        return (
          card.collectable &&
          card.factions.some(faction =>
            factionFilter.value.includes(faction?.id as string)
          )
        );
      })
      .sort(sortUnitFunction);
  });

  const { data: loadouts, isLoading: isLoadoutsLoading } = useConvexAuthedQuery(
    api.loadout.myLoadouts,
    {}
  );

  return {
    factionFilter,
    loadouts,
    isLoadoutsLoading,
    collection,
    isCollectionLoading,
    displayedCards
  };
};

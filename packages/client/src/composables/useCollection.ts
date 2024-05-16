import { api } from '@game/api';
import type { CollectionItemDto } from '@game/api/src/convex/collection/collection.mapper';
import { CARD_KINDS, CARDS, type Faction, FACTIONS } from '@game/sdk';
import type { CardBlueprint } from '@game/sdk/src/card/card-blueprint';

export const useCollection = () => {
  const sessionId = useSessionId();
  const { data: me } = useConvexQuery(
    api.users.me,
    computed(() => ({ sessionId: sessionId.value }))
  );

  const { data: collection, isLoading: isCollectionLoading } = useConvexAuthedQuery(
    api.collection.myCollection,
    {},
    { enabled: !!me.value }
  );

  const factions = Object.values(FACTIONS).map(f => f.id);

  const factionFilter = ref<Faction | null>(null);

  const allCards = computed(() =>
    collection.value
      .map(item => {
        return { ...item, card: CARDS[item.cardId] };
      })
      .filter(item => {
        return item.card.collectable;
      })
  );

  type CollectionItemWithCard = CollectionItemDto & { card: CardBlueprint };

  const sortUnitFunction = (a: CollectionItemWithCard, b: CollectionItemWithCard) => {
    // put generals first
    if (a.card.kind === CARD_KINDS.GENERAL && b.card.kind === CARD_KINDS.MINION)
      return -1;
    if (b.card.kind === CARD_KINDS.GENERAL && a.card.kind === CARD_KINDS.MINION) return 1;

    const aFaction = a.card.factions[0];
    const bFaction = b.card.factions[0];

    // put neutral units last
    if (aFaction && !bFaction) return -1;
    if (bFaction && !aFaction) return 1;

    const factionDiff =
      factions.indexOf(bFaction?.id as string) - factions.indexOf(aFaction?.id as string);
    if (factionDiff !== 0) return factionDiff * -1;

    return a.card.cost - b.card.cost;
  };

  const displayedCards = computed(() => {
    if (!collection.value) return [];
    if (!factionFilter.value) return allCards.value.sort(sortUnitFunction);

    const filter = factionFilter.value;
    return allCards.value
      .filter(({ card }) => {
        return card.factions.some(faction => faction?.equals(filter));
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

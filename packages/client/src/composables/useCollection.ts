import { api } from '@game/api';
import type { CollectionItemDto } from '@game/api/src/convex/collection/collection.mapper';
import { CARD_KINDS, CARDS, type Faction, FACTIONS } from '@game/sdk';
import type { CardBlueprint } from '@game/sdk/src/card/card-blueprint';
import { isString, type Nullable } from '@game/shared';

export const useCollection = () => {
  const { data: me } = useConvexAuthedQuery(api.users.me, {});

  const { data: collection, isLoading: isCollectionLoading } = useConvexAuthedQuery(
    api.collection.myCollection,
    {},
    { enabled: !!me.value }
  );

  const factions = Object.values(FACTIONS).map(f => f.id);

  const factionFilter = ref<Nullable<Faction>>(undefined);
  const textFilter = ref<Nullable<string>>(null);
  const textFilterDebounced = refDebounced(textFilter, 100);

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
    const aFaction = a.card.faction;
    const bFaction = b.card.faction;

    // put neutral units last
    if (aFaction && !bFaction) return -1;
    if (bFaction && !aFaction) return 1;

    const factionDiff =
      factions.indexOf(bFaction?.id as string) - factions.indexOf(aFaction?.id as string);
    if (factionDiff !== 0) return factionDiff * -1;

    // put generals first
    if (a.card.kind === CARD_KINDS.GENERAL && b.card.kind === CARD_KINDS.MINION)
      return -1;
    if (b.card.kind === CARD_KINDS.GENERAL && a.card.kind === CARD_KINDS.MINION) return 1;

    return a.card.cost - b.card.cost;
  };

  const matchesTextFilter = (str: string) =>
    textFilterDebounced.value
      ? str
          .toLocaleLowerCase()
          .trim()
          .includes(textFilterDebounced.value.toLocaleLowerCase().trim())
      : true;

  const displayedCards = computed(() => {
    console.log('run');
    if (!collection.value) return [];

    return allCards.value
      .filter(({ card }) => {
        if (factionFilter !== undefined) {
          if (factionFilter.value === null && card.faction !== null) return false;
          if (factionFilter.value && !card.faction?.equals(factionFilter.value))
            return false;
        }

        return (
          matchesTextFilter(card.name) ||
          matchesTextFilter(card.description) ||
          (card.keywords ?? []).some(
            keyword =>
              matchesTextFilter(keyword.name) ||
              keyword.aliases.some(alias => isString(alias) && matchesTextFilter(alias))
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
    textFilter,
    loadouts,
    isLoadoutsLoading,
    collection,
    isCollectionLoading,
    displayedCards
  };
};

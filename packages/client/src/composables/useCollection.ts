import { api } from '@game/api';
import type { CollectionItemDto } from '@game/api/src/convex/collection/collection.mapper';
import { CARD_KINDS, CARDS, type Faction, FACTIONS } from '@game/sdk';
import type { CardBlueprint } from '@game/sdk/src/card/card-blueprint';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';
import { isString, isDefined, type Nullable } from '@game/shared';

export type CostFilter = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const useCollection = () => {
  const { data: me } = useConvexAuthedQuery(api.users.me, {});

  const { data: collection, isLoading: isCollectionLoading } = useConvexAuthedQuery(
    api.collection.myCollection,
    {},
    { enabled: !!me.value }
  );

  const factions = Object.values(FACTIONS).map(f => f.id);

  const factionFilter = ref<Nullable<Faction>>(undefined);
  const costFilter = ref<Nullable<CostFilter>>(undefined);
  const textFilter = ref<Nullable<string>>(null);
  const textFilterDebounced = refDebounced(textFilter, 100);

  const allCards = computed(() =>
    collection.value
      .map(item => {
        return { ...item, card: parseSerializeBlueprint(CARDS[item.cardId]) };
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

  const matchesCostFilter = (cost: number) => {
    if (!isDefined(costFilter.value)) return true;
    if (costFilter.value === 8) return cost >= 8;
    return cost === costFilter.value;
  };

  const displayedCards = computed(() => {
    if (!collection.value) return [];

    return allCards.value
      .filter(({ card }) => {
        if (factionFilter.value !== undefined) {
          if (factionFilter.value === null && card.faction !== null) return false;
          if (factionFilter.value && !card.faction?.equals(factionFilter.value))
            return false;
        }

        if (!matchesCostFilter(card.cost)) return false;

        return (
          matchesTextFilter(card.name) ||
          matchesTextFilter(card.description) ||
          matchesTextFilter(card.kind) ||
          matchesTextFilter(card.rarity) ||
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
    costFilter,
    loadouts,
    isLoadoutsLoading,
    collection,
    isCollectionLoading,
    displayedCards
  };
};

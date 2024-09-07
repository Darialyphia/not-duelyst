import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import type { GameFormatDto } from '@game/api/src/convex/formats/format.mapper';
import { CARD_KINDS, CARDS, defaultConfig, type Faction, FACTIONS } from '@game/sdk';
import type { CardBlueprint } from '@game/sdk/src/card/card-blueprint';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';
import { isString, isDefined, type Nullable } from '@game/shared';

export type CostFilter = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type CollectionItemWithCard = {
  cardId: string;
  pedestalId: string;
  cardBackId: string;
  _id?: Id<'collectionItems'>;
} & {
  card: CardBlueprint;
};

export const useCollection = () => {
  const { data: formats } = useConvexAuthedQuery(api.formats.all, {});

  const selectedFormatId = ref<Id<'formats'> | undefined>();

  const standardFormat: Pick<GameFormatDto, 'config' | 'cards'> = {
    config: defaultConfig,
    cards: CARDS
  };

  const selectedFormat = computed(() => {
    if (!formats.value) return standardFormat;
    return (
      formats.value.find(format => format._id === selectedFormatId.value) ??
      standardFormat
    );
  });

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

  const allCards = computed(() => {
    return Object.values({ ...CARDS, ...selectedFormat.value.cards })
      .filter(c => c.collectable)
      .map(card => {
        const collectionItem = collection.value.find(item => item.cardId === card.id);
        return {
          _id: collectionItem?._id,
          cardId: card.id,
          card: parseSerializeBlueprint(card),
          pedestalId: collectionItem?.pedestalId ?? 'default',
          cardBackId: collectionItem?.cardBackId ?? 'default'
        };
      });
  });

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
    if (a.card.kind === CARD_KINDS.GENERAL && b.card.kind !== CARD_KINDS.GENERAL)
      return -1;
    if (b.card.kind === CARD_KINDS.GENERAL && a.card.kind !== CARD_KINDS.GENERAL)
      return 1;

    if (a.card.cost !== b.card.cost) {
      return a.card.cost - b.card.cost;
    }

    return a.card.name.localeCompare(b.card.name);
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
    displayedCards,
    allCards,
    selectedFormat,
    selectedFormatId
  };
};

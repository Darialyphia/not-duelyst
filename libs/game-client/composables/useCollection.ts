import { api } from '@hc/api';
import type { CollectionItemDto } from '@hc/api/convex/collection/collection.utils';
import { UNITS, type UnitBlueprint } from '@hc/sdk';
import { FACTIONS, type FactionId } from '@hc/sdk/src/faction/faction-lookup';
import { isDefined, type Nullable } from '@hc/shared';

export const useCollection = ({
  itemsPerPage,
  selectedGeneral
}: {
  itemsPerPage: number;
  selectedGeneral: MaybeRefOrGetter<Nullable<UnitBlueprint>>;
}) => {
  const { data: collection, isLoading: isCollectionLoading } = useConvexAuthedQuery(
    api.collection.myCollection,
    {}
  );
  const sidebarView = ref<'list' | 'form'>('list');

  const factions: FactionId[] = Object.values(FACTIONS).map(f => f.id);
  const allowedFactions = computed(() => {
    if (sidebarView.value === 'list') return factions;

    const general = toValue(selectedGeneral);
    if (!general) return factions;

    return factions.filter(
      faction => faction === general.faction.id || faction === 'neutral'
    );
  });

  const page = ref(0);

  const factionFilter = ref<FactionId>(factions[0]);
  watchEffect(() => {
    const general = toValue(selectedGeneral);
    if (general) {
      factionFilter.value = general?.faction.id;
    }
  });
  const factionIndex = computed(() => allowedFactions.value.indexOf(factionFilter.value));

  const allUnits = computed(() =>
    collection.value.map(item => {
      return { ...item, unit: UNITS[item.unitId] };
    })
  );

  type CollectionItemWithUnit = CollectionItemDto & { unit: UnitBlueprint };

  const sortUnitFunction = (a: CollectionItemWithUnit, b: CollectionItemWithUnit) => {
    const factionDiff =
      factions.indexOf(b.unit.faction.id) - factions.indexOf(a.unit.faction.id);
    if (factionDiff !== 0) return factionDiff;

    return a.unit.summonCost - b.unit.summonCost;
  };

  const filteredUnits = computed(() => {
    if (!collection.value) return [];

    if (sidebarView.value === 'list') {
      return allUnits.value
        .filter(({ unit }) => unit.faction.id === factionFilter.value)
        .sort(sortUnitFunction);
    }

    if (!toValue(selectedGeneral)) {
      return allUnits.value
        .filter(({ unit }) => unit.kind === 'GENERAL')
        .sort(sortUnitFunction);
    }

    return allUnits.value
      .filter(({ unit }) => unit.faction.id === factionFilter.value)
      .filter(({ unit }) =>
        sidebarView.value === 'list' || isDefined(toValue(selectedGeneral))
          ? true
          : unit.kind === 'GENERAL'
      )
      .sort((a, b) => {
        const factionDiff =
          factions.indexOf(b.unit.faction.id) - factions.indexOf(a.unit.faction.id);
        if (factionDiff !== 0) return factionDiff;
        return a.unit.summonCost - b.unit.summonCost;
      });
  });

  const displayedUnits = computed(() =>
    filteredUnits.value.slice(
      page.value * itemsPerPage,
      page.value * itemsPerPage + itemsPerPage
    )
  );

  const pageCount = computed(() => Math.ceil(filteredUnits.value.length / itemsPerPage));

  const prevPage = () => {
    if (page.value > 0) {
      page.value--;
    } else {
      const newIndex =
        factionIndex.value === 0
          ? allowedFactions.value.length - 1
          : factionIndex.value - 1;
      factionFilter.value = allowedFactions.value[newIndex];
      nextTick(() => {
        page.value = pageCount.value - 1;
      });
    }
  };

  const nextPage = () => {
    if (page.value < pageCount.value - 1) {
      page.value++;
    } else {
      const newIndex =
        factionIndex.value === allowedFactions.value.length - 1
          ? 0
          : factionIndex.value + 1;
      factionFilter.value = allowedFactions.value[newIndex];
      page.value = 0;
    }
  };

  const { data: loadouts, isLoading: isLoadoutsLoading } = useConvexAuthedQuery(
    api.loadout.myLoadouts,
    {}
  );

  return {
    page,
    pageCount,
    prevPage,
    nextPage,
    factionFilter,
    sidebarView,
    loadouts,
    isLoadoutsLoading,
    collection,
    isCollectionLoading,
    displayedUnits
  };
};

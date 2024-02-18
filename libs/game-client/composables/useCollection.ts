import { api } from '@hc/api';
import type { CollectionItemDto } from '@hc/api/convex/collection/collection.utils';
import { UNITS, type UnitBlueprint } from '@hc/sdk';
import { FACTIONS, type FactionId } from '@hc/sdk/src/faction/faction-lookup';

export const useCollection = ({ itemsPerPage }: { itemsPerPage: number }) => {
  const { data: collection, isLoading: isCollectionLoading } = useConvexAuthedQuery(
    api.collection.myCollection,
    {}
  );

  const factions: FactionId[] = Object.values(FACTIONS).map(f => f.id);

  const page = ref(0);

  const factionFilter = ref<FactionId>(factions[0]);

  const allUnits = computed(() =>
    collection.value.map(item => {
      return { ...item, unit: UNITS[item.unitId] };
    })
  );

  type CollectionItemWithUnit = CollectionItemDto & { unit: UnitBlueprint };

  const sortUnitFunction = (a: CollectionItemWithUnit, b: CollectionItemWithUnit) => {
    const aFaction = a.unit.factions[0];
    const bFaction = b.unit.factions[0];
    if (aFaction && !bFaction) {
      return 1;
    }
    if (!aFaction && bFaction) {
      return -1;
    }
    if (aFaction && bFaction) {
      const factionDiff = factions.indexOf(bFaction.id) - factions.indexOf(aFaction.id);
      if (factionDiff !== 0) return factionDiff;
    }

    return a.unit.summonCost - b.unit.summonCost;
  };

  const filteredUnits = computed(() => {
    if (!collection.value) return [];

    return allUnits.value
      .filter(({ unit }) => unit.factions.some(({ id }) => id === factionFilter.value))
      .sort(sortUnitFunction);
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
      nextTick(() => {
        page.value = pageCount.value - 1;
      });
    }
  };

  const nextPage = () => {
    if (page.value < pageCount.value - 1) {
      page.value++;
    } else {
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
    loadouts,
    isLoadoutsLoading,
    collection,
    isCollectionLoading,
    displayedUnits
  };
};

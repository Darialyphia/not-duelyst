import { api } from '@hc/api';
import { UNITS } from '@hc/sdk';
import { FACTIONS, type FactionId } from '@hc/sdk/src/faction/faction-lookup';

export const useCollection = ({
  itemsPerPage,
  hasSelectedGenral
}: {
  itemsPerPage: number;
  hasSelectedGenral: MaybeRefOrGetter<boolean>;
}) => {
  const { data: collection, isLoading: isCollectionLoading } = useConvexAuthedQuery(
    api.collection.myCollection,
    {}
  );

  const factions: FactionId[] = Object.values(FACTIONS).map(f => f.id);
  const page = ref(0);

  const factionFilter = ref<FactionId>('haven');
  const factionIndex = computed(() => factions.indexOf(factionFilter.value));

  const filteredUnits = computed(() =>
    collection.value
      ? collection.value
          .map(item => ({ ...item, unit: UNITS[item.unitId] }))
          .filter(({ unit }) => unit.faction.id === factionFilter.value)
          .filter(({ unit }) =>
            sidebarView.value === 'list' || toValue(hasSelectedGenral)
              ? true
              : unit.kind === 'GENERAL'
          )
          .sort((a, b) => {
            const factionDiff =
              factions.indexOf(b.unit.faction.id) - factions.indexOf(a.unit.faction.id);
            if (factionDiff !== 0) return factionDiff;
            return a.unit.summonCost - b.unit.summonCost;
          })
      : []
  );

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
        factionIndex.value === 0 ? factions.length - 1 : factionIndex.value - 1;
      factionFilter.value = factions[newIndex];
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
        factionIndex.value === factions.length - 1 ? 0 : factionIndex.value + 1;
      factionFilter.value = factions[newIndex];
      page.value = 0;
    }
  };

  const { data: loadouts, isLoading: isLoadoutsLoading } = useConvexAuthedQuery(
    api.loadout.myLoadouts,
    {}
  );

  const sidebarView = ref<'list' | 'form'>('list');

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

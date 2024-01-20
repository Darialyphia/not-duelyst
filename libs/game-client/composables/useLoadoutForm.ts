import { api } from '@hc/api';
import type { Id } from '@hc/api/convex/_generated/dataModel';
import type { LoadoutDto } from '@hc/api/convex/loadout/loadout.mapper';
import { FACTIONS, UNITS, type UnitBlueprint } from '@hc/sdk';

export const useLoadoutForm = ({
  defaultName,
  maxSize,
  onSuccess
}: {
  defaultName: MaybeRefOrGetter<string>;
  maxSize: number;
  onSuccess: () => void;
}) => {
  const values = ref<{
    loadoutId?: Id<'loadouts'>;
    name: string;
    generalId: string | null;
    unitIds: Set<string>;
  }>();

  const general = computed(() =>
    values.value?.generalId ? UNITS[values.value.generalId] : null
  );

  const initEmpty = () => {
    values.value = {
      generalId: null,
      unitIds: new Set(),
      name: toValue(defaultName)
    };
  };

  const initFromLoadout = (loadout: LoadoutDto) => {
    values.value = {
      loadoutId: loadout._id,
      generalId: loadout.generalId,
      unitIds: new Set(loadout.unitIds),
      name: loadout.name
    };
  };

  const loadoutIsFull = computed(() => values.value!.unitIds.size >= maxSize);

  const canAddUnit = (unitId: string) => {
    const unit = UNITS[unitId];
    if (!general.value) return unit.kind === 'GENERAL';

    return unit.faction === FACTIONS.neutral || unit.faction === general.value.faction;
  };

  const isInLoadout = (unitId: string) => {
    if (UNITS[unitId].kind === 'GENERAL') {
      return values.value?.generalId === unitId;
    }
    return values.value?.unitIds.has(unitId);
  };

  const toggleUnit = (unit: UnitBlueprint) => {
    if (!canAddUnit(unit.id)) return;

    switch (unit.kind) {
      case 'GENERAL':
        if (isInLoadout(unit.id)) {
          if (values.value?.unitIds.size === 0) {
            values.value.generalId = null;
          }
        } else {
          values.value!.generalId = unit.id;
        }
        break;
      case 'SOLDIER':
        if (isInLoadout(unit.id)) {
          values.value!.unitIds.delete(unit.id);
        } else if (!loadoutIsFull.value) {
          values.value!.unitIds.add(unit.id);
        }
        break;
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
    if (!values.value) return;
    if (values.value.loadoutId) {
      updateDeck({
        loadoutId: values.value.loadoutId,
        name: values.value!.name,
        generalId: values.value.generalId!,
        units: [...values.value.unitIds]
      });
    } else {
      saveNewDeck({
        name: values.value!.name,
        generalId: values.value.generalId!,
        units: [...values.value.unitIds]
      });
    }
  };

  return {
    values,
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

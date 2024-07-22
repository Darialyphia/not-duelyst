import type { UnitConditionBase, UnitConditionExtras } from '@game/sdk';

export const [useUnitConditionsProvider, _useUnitConditions] = createInjectionState(
  (
    extrasDict: Ref<
      Partial<Record<UnitConditionExtras['type'], { label: string; params: string[] }>>
    >
  ) => {
    const baseDictDict: Record<
      UnitConditionBase['type'],
      { label: string; params: string[] }
    > = {
      any_unit: { label: 'Is any unit', params: [] },
      is_self: { label: 'is the unit being played', params: [] },
      is_ally: { label: 'Is an ally', params: [] },
      is_enemy: { label: 'Is an enemy', params: [] },
      is_general: { label: 'Is a general', params: [] },
      is_minion: { label: 'Is a minion', params: [] },
      is_nearby: { label: 'Is nearby', params: ['unit', 'cell'] },
      is_in_front: { label: 'Is in front of', params: ['unit'] },
      is_nearest_in_front: { label: 'Is the closest unit in front of', params: ['unit'] },
      is_behind: { label: 'Is behind', params: ['unit'] },
      is_nearest_behind: { label: 'Is the closest unit behind', params: ['unit'] },
      is_above: { label: 'Is above', params: ['unit'] },
      is_nearest_above: { label: 'Is the closest unit above', params: ['unit'] },
      is_below: { label: 'Is below', params: ['unit'] },
      is_nearest_below: { label: 'Is the closest unit  below', params: ['unit'] },
      is_manual_target: { label: 'Is one of this card target', params: ['index'] },
      is_manual_target_general: {
        label: "Is one of this card target's general",
        params: ['index']
      },
      has_keyword: { label: 'Has a specific keyword', params: ['keyword'] }
    };

    return computed(() => ({ ...baseDictDict, ...extrasDict.value }));
  }
);

export const useUnitConditions = () => {
  const value = _useUnitConditions();
  if (!value) throw new Error('Use useUnitConditions() inside its provider');

  return value;
};

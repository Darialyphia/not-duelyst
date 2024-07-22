import type {
  CardConditionBase,
  CardConditionExtras,
  CellConditionBase,
  CellConditionExtras,
  PlayerConditionBase,
  PlayerConditionExtras,
  UnitConditionBase,
  UnitConditionExtras
} from '@game/sdk';

export const [useUnitConditionsProvider, _useUnitConditions] = createInjectionState(
  (
    extrasDict: Ref<
      Partial<Record<UnitConditionExtras['type'], { label: string; params: string[] }>>
    >
  ) => {
    const baseDict: Record<
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

    return computed(() => ({ ...baseDict, ...extrasDict.value }));
  }
);

export const useUnitConditions = () => {
  const value = _useUnitConditions();
  if (!value) throw new Error('Use useUnitConditions() inside its provider');

  return value;
};

export const [usePlayerConditionsProvider, _usePlayerConditions] = createInjectionState(
  (
    extrasDict: Ref<
      Partial<Record<PlayerConditionExtras['type'], { label: string; params: string[] }>>
    >
  ) => {
    const baseDict: Record<
      PlayerConditionBase['type'],
      { label: string; params: string[] }
    > = {
      any_player: { label: 'Is any player', params: [] },
      ally_player: { label: 'Is you', params: [] },
      enemy_player: { label: 'Is your opponent', params: [] },
      is_manual_target_owner: {
        label: "Is one of this card target's owner",
        params: ['index']
      }
    };

    return computed(() => ({ ...baseDict, ...extrasDict.value }));
  }
);

export const usePlayerConditions = () => {
  const value = _usePlayerConditions();
  if (!value) throw new Error('Use usePlayerConditions() inside its provider');

  return value;
};

export const [useCardConditionsProvider, _useCardConditions] = createInjectionState(
  (
    extrasDict: Ref<
      Partial<Record<CardConditionExtras['type'], { label: string; params: string[] }>>
    >
  ) => {
    const baseDict: Record<
      CardConditionBase['type'],
      { label: string; params: string[] }
    > = {
      any_card: { label: 'Is any card', params: [] },
      self: { label: 'Is you', params: [] },
      minion: { label: 'Is a minion card', params: [] },
      spell: { label: 'Is a spell card', params: [] },
      artifact: { label: 'Is an artifact card', params: [] },
      cost: { label: 'Is a card that costs X', params: ['operator', 'amount'] },
      index_in_hand: {
        label: 'Is at position X in your hand',
        params: ['index']
      }
    };

    return computed(() => ({ ...baseDict, ...extrasDict.value }));
  }
);

export const useCardConditions = () => {
  const value = _useCardConditions();
  if (!value) throw new Error('Use useCardConditions() inside its provider');

  return value;
};

export const [useCellConditionsProvider, _useCellConditions] = createInjectionState(
  (
    extrasDict: Ref<
      Partial<Record<CellConditionExtras['type'], { label: string; params: string[] }>>
    >
  ) => {
    const baseDict: Record<
      CellConditionBase['type'],
      { label: string; params: string[] }
    > = {
      any_cell: { label: 'Is anywhere', params: [] },
      is_empty: { label: 'Is empty', params: [] },
      is_top_left_corner: { label: 'Is the top-left corner', params: [] },
      is_top_right_corner: { label: 'Is the top-right corner', params: [] },
      is_bottom_left_corner: { label: 'Is the bottom-left corner', params: [] },
      is_bottom_right_corner: { label: 'Is the bottom-right corner', params: [] },
      has_unit: { label: 'Has a unit on it', params: ['unit'] },
      is_nearby: { label: 'Is nearby a unit', params: ['unit'] },
      is_in_front: { label: 'Is in front of a unit', params: ['unit'] },
      is_behind: { label: 'Is behind a unit', params: ['unit'] },
      is_above: { label: 'Is above a unit', params: ['unit'] },
      is_below: { label: 'Is below a unit', params: ['unit'] },
      is_manual_target: { label: 'Is one of this card target', params: ['index'] },
      is_at: { label: 'Is at coordinates', params: ['x', 'y', 'z'] }
    };

    return computed(() => ({ ...baseDict, ...extrasDict.value }));
  }
);

export const useCellConditions = () => {
  const value = _useCellConditions();
  if (!value) throw new Error('Use useCellConditions() inside its provider');

  return value;
};

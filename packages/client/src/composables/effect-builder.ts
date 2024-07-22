import type {
  CardConditionBase,
  CardConditionExtras,
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

export const [usePlayerConditionsProvider, _usePlayerConditions] = createInjectionState(
  (
    extrasDict: Ref<
      Partial<Record<PlayerConditionExtras['type'], { label: string; params: string[] }>>
    >
  ) => {
    const baseDictDict: Record<
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

    return computed(() => ({ ...baseDictDict, ...extrasDict.value }));
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
    const baseDictDict: Record<
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
        label: 'Is at position X in your hand (starts at 0)',
        params: ['index']
      }
    };

    return computed(() => ({ ...baseDictDict, ...extrasDict.value }));
  }
);

export const useCardConditions = () => {
  const value = _useCardConditions();
  if (!value) throw new Error('Use useCardConditions() inside its provider');

  return value;
};

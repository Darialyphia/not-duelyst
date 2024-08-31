import {
  AmountNode,
  CellNode,
  NumericOperatorNode,
  PlayerNode,
  UnitNode,
  KeywordNode,
  TagNode
} from '#components';
import type {
  ArtifactCondition,
  CardConditionBase,
  CardConditionExtras,
  CellConditionBase,
  CellConditionExtras,
  GlobalCondition,
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
      any_unit: { label: 'Any unit', params: [] },
      is_self: { label: 'This unit', params: ['not'] },
      is_ally: { label: 'An ally', params: ['not'] },
      is_enemy: { label: 'An enemy', params: ['not'] },
      is_general: { label: 'A general', params: ['not'] },
      is_minion: { label: 'A minion', params: ['not'] },
      is_nearby: { label: 'A unit nearby', params: ['not', 'unit', 'cell'] },
      is_in_front: { label: 'The unit in front of', params: ['not', 'unit'] },
      is_nearest_in_front: {
        label: 'The closest unit in front of',
        params: ['not', 'unit']
      },
      is_behind: { label: 'The unit behind', params: ['not', 'unit'] },
      is_nearest_behind: { label: 'The closest unit behind', params: ['not', 'unit'] },
      is_above: { label: 'The unit above', params: ['not', 'unit'] },
      is_nearest_above: { label: 'The closest unit above', params: ['not', 'unit'] },
      is_below: { label: 'The unit below', params: ['not', 'unit'] },
      is_nearest_below: { label: 'The closest unit  below', params: ['not', 'unit'] },
      is_manual_target: { label: "One of this card's target", params: ['not', 'index'] },
      is_manual_target_general: {
        label: "One of this card target's general",
        params: ['not', 'index']
      },
      has_keyword: { label: 'A unit with a keyword', params: ['not', 'keyword'] },
      has_attack: { label: 'A unit with attack', params: ['not', 'operator', 'amount'] },
      has_hp: { label: 'A unit with hp', params: ['not', 'operator', 'amount'] },
      is_exhausted: { label: 'An exhausted unit', params: ['not'] },
      has_blueprint: { label: 'A unit with the name', params: ['blueprint', 'not'] },
      has_tag: { label: 'A unit with a tag', params: ['tag', 'not'] },
      is_same_column: { label: 'A unit on the same column', params: ['cell', 'not'] },
      is_same_row: { label: 'A unit on the same row', params: ['cell', 'not'] },
      has_lowest_attack: { label: 'A unit with the lowest attack', params: ['not'] },
      has_highest_attack: { label: 'A unit with the highest attack', params: ['not'] }
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
      any_player: { label: 'Any player', params: [] },
      ally_player: { label: 'You', params: [] },
      enemy_player: { label: 'Your opponent', params: [] },
      is_manual_target_owner: {
        label: "One of this card target's owner",
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
      any_card: { label: 'Any card', params: [] },
      self: { label: 'This card', params: [] },
      minion: { label: 'A minion card', params: [] },
      spell: { label: 'A spell card', params: [] },
      artifact: { label: 'An artifact card', params: [] },
      cost: { label: 'A card that costs X', params: ['operator', 'amount'] },
      index_in_hand: {
        label: 'A card at position X in your hand',
        params: ['index']
      },
      from_player: {
        label: 'Belongs to a player',
        params: ['player']
      },
      has_blueprint: {
        label: 'A card with the name',
        params: ['blueprint']
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
      is_nearby: { label: 'Is nearby a unit or cell', params: ['unit', 'cell'] },
      is_in_front: { label: 'Is in front of a unit', params: ['unit'] },
      is_behind: { label: 'Is behind a unit', params: ['unit'] },
      is_above: { label: 'Is above a unit', params: ['unit'] },
      is_below: { label: 'Is below a unit', params: ['unit'] },
      is_manual_target: { label: 'Is one of this card target', params: ['index'] },
      is_at: { label: 'Is at coordinates', params: ['x', 'y', 'z'] },
      '2x2_area': { label: 'Is a 2x2 area', params: ['topLeft'] },
      '3x3_area': { label: 'Is a 3x3 area', params: ['center'] },
      within_cells: { label: 'Within X cells', params: ['cell', 'amount'] }
    };

    return computed(() => ({ ...baseDict, ...extrasDict.value }));
  }
);

export const useCellConditions = () => {
  const value = _useCellConditions();
  if (!value) throw new Error('Use useCellConditions() inside its provider');

  return value;
};

export type Params = Component | null | { [key: string]: Params };
export const [useGlobalConditionsProvider, _useGlobalConditions] = createInjectionState(
  (
    extrasDict: Ref<
      Partial<Record<GlobalCondition['type'], { label: string; params: string[] }>>
    >
  ) => {
    const baseDict: Record<
      GlobalCondition['type'],
      { label: string; params: Record<string, Params> }
    > = {
      active_player: {
        label: 'Only if the active player is',
        params: { player: PlayerNode }
      },
      player_gold: {
        label: "Only if a player's gold...",
        params: {
          player: PlayerNode,
          operator: NumericOperatorNode,
          amount: AmountNode
        }
      },
      player_hp: {
        label: "Only if a player's hp...",
        params: {
          player: PlayerNode,
          operator: NumericOperatorNode,
          amount: AmountNode
        }
      },
      unit_state: {
        label: 'Only if a unit is...',
        params: {
          unit: UnitNode,
          mode: null,
          position: CellNode,
          attack: {
            operator: NumericOperatorNode,
            amount: AmountNode
          },
          hp: {
            operator: NumericOperatorNode,
            amount: AmountNode
          },
          keyword: KeywordNode,
          tag: TagNode
        }
      },
      played_from_hand: {
        label: 'Only if this card is being played from hand',
        params: {}
      },
      target_exists: {
        label: 'A target had been selected',
        params: {
          index: null
        }
      },
      player_has_more_minions: {
        label: 'A player controls more minions',
        params: {
          player: PlayerNode
        }
      }
    };

    return computed(() => ({ ...baseDict, ...extrasDict.value }));
  }
);

export const useGlobalConditions = () => {
  const value = _useGlobalConditions();
  if (!value) throw new Error('Use useGlobalConditions() inside its provider');

  return value;
};

export const [useArtifactConditionsProvider, _useArtifactConditions] =
  createInjectionState(() => {
    const baseDict: Record<
      ArtifactCondition['type'],
      { label: string; params: string[] }
    > = {
      equiped_by_ally: { label: 'Is equiped to your general', params: [] },
      equiped_by_enemy: { label: 'Is equiped to the enemy general', params: [] },
      last_equiped: { label: 'The last equiped artifact', params: [] },
      has_durability: { label: 'Has durability', params: ['amount'] },
      position: { label: 'Is on position', params: ['index'] }
    };

    return computed(() => ({ ...baseDict }));
  });

export const useArtifactConditions = () => {
  const value = _useArtifactConditions();
  if (!value) throw new Error('Use useArtifactConditions() inside its provider');

  return value;
};

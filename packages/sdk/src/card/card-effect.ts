import type {
  CardCondition,
  CardConditionBase,
  CardConditionExtras
} from './conditions/card-conditions';
import type { GlobalCondition } from './conditions/global-conditions';
import type { PlayerCondition } from './conditions/player-condition';
import type {
  UnitCondition,
  UnitConditionBase,
  UnitConditionExtras
} from './conditions/unit-conditions';
import type { CellCondition } from './conditions/cell-conditions';
import type { CardKind } from './card-enums';
import type { Trigger, TriggerFrequency } from './card-action-triggers';
import type { Amount } from './helpers/amount';
import type { CardBlueprintId } from './card';
import type { KeywordId } from '../utils/keywords';
import type { Point } from '@game/shared';
import type { ArtifactCondition } from './conditions/artifact-conditions';
import type { CardTargetsConfig } from './card-targets';

export type Filter<T> = { candidates: T[][]; random?: boolean };

export type NumericOperator = 'equals' | 'more_than' | 'less_than';

export type ConditionOverrides = {
  unit?: UnitCondition['type'];
  card?: CardCondition['type'];
};

export type Action<
  T extends ConditionOverrides = {
    unit: UnitConditionExtras['type'];
    card: CardConditionExtras['type'];
  }
> =
  | {
      type: 'deal_damage';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        amount: Amount<T>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'heal';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        amount: Amount<T>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'draw_cards';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        amount: Amount<T>;
        player: Filter<PlayerCondition>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        kind?: Exclude<CardKind, 'GENERAL'>;
      };
    }
  | {
      type: 'change_stats';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        mode: 'give' | 'set';
        attack?: { amount: Amount<T>; activeWhen?: Filter<GlobalCondition<T>> };
        hp?: { amount: Amount<T>; activeWhen?: Filter<GlobalCondition<T>> };
        speed?: { amount: Amount<T>; activeWhen?: Filter<GlobalCondition<T>> };
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        stackable: boolean;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'change_damage_taken';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        mode: 'give' | 'set';
        amount: Amount<T>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        source?: Filter<
          CardConditionBase | Extract<CardConditionExtras, { type: T['unit'] }>
        >;
        frequency: TriggerFrequency;
        stackable: boolean;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'change_damage_dealt';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        mode: 'give' | 'set';
        amount: Amount<T>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        frequency: TriggerFrequency;
        stackable: boolean;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'change_heal_received';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        mode: 'give' | 'set';
        amount: Amount<T>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        frequency: TriggerFrequency;
        stackable: boolean;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'activate_unit';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'provoke';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'celerity';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'ranged';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'airdrop';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'rush';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'backstab';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        amount: Amount<T>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'dispel_cell';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        cells: Filter<CellCondition>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'destroy_unit';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'bounce_unit';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        targets: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'add_effect';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        effect: CardEffectConfig<Trigger[]>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        linkToCard?: boolean;
      };
    }
  | {
      type: 'zeal';
      params: {
        effect: CardEffectConfig<Trigger[]>;
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'change_card_cost';
      params: {
        player: Filter<PlayerCondition>;
        card: Filter<
          CardConditionBase | Extract<CardConditionExtras, { type: T['unit'] }>
        >;
        amount: Amount<T>;
        occurences_count?: number;
        duration: 'always' | 'end_of_turn' | 'start_of_next_turn';
        activeWhen?: Filter<GlobalCondition<T>>;
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'generate_card';
      params: {
        location: 'hand' | 'deck';
        player: Filter<PlayerCondition>;
        blueprint: CardBlueprintId[];
        ephemeral: boolean;
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'teleport_unit';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        cell: Filter<CellCondition>;
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'swap_units';
      params: {
        unit1: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        unit2: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'change_replaces_count';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        mode: 'give' | 'set';
        amount: Amount<T>;
        player: Filter<PlayerCondition>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        stackable: boolean;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'flying';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'barrier';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'frenzy';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'structure';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'ephemeral';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'elusive';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'structure';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'spawn';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        blueprint: CardBlueprintId[];
        position: Filter<CellCondition>;
      };
    }
  | {
      type: 'play_card';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        card: Filter<
          CardConditionBase | Extract<CardConditionExtras, { type: T['card'] }>
        >;
        position: Filter<CellCondition>;
        targets: Filter<CellCondition>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'remove_keyword';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        keyword: KeywordId;
      };
    }
  | {
      type: 'equip_artifact';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        player: Filter<PlayerCondition>;
        blueprint: CardBlueprintId[];
      };
    }
  | {
      type: 'unequip_artifact';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        artifact: Filter<ArtifactCondition>;
      };
    }
  | {
      type: 'summon_unit';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        player: Filter<PlayerCondition>;
        blueprint: CardBlueprintId[];
        position: Filter<CellCondition>;
      };
    }
  | {
      type: 'change_unit_owner';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        player: Filter<PlayerCondition>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        filter?: Filter<GlobalCondition<T>>;
      };
    }
  | {
      type: 'blast';
      params: {
        activeWhen?: Filter<GlobalCondition<T>>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        filter?: Filter<GlobalCondition<T>>;
      };
    }
  | {
      type: 'tough';
      params: {
        stacks: Amount<T>;
        activeWhen?: Filter<GlobalCondition<T>>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        filter?: Filter<GlobalCondition<T>>;
      };
    }
  | {
      type: 'vulnerable';
      params: {
        stacks: Amount<T>;
        activeWhen?: Filter<GlobalCondition<T>>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        filter?: Filter<GlobalCondition<T>>;
      };
    }
  | {
      type: 'fearsome';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'change_can_attack';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        target: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'change_can_be_attacked';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        target: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'dispel_entity';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'cleanse_entity';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'aura';
      params: {
        effect: CardEffectConfig<Trigger[]>;
        isElligible: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        activeWhen?: Filter<GlobalCondition<T>>;
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'essence';
      params: {
        effect: CardEffectConfig<Trigger[]>;
        cost: number;
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        targets: CardTargetsConfig;
      };
    }
  | {
      type: 'slay';
      params: {
        effect: CardEffectConfig<Trigger[]>;
        filter?: Filter<GlobalCondition<T>>;
        activeWhen?: Filter<GlobalCondition<T>>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'create_tile';
      params: {
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        player: Filter<PlayerCondition>;
        tile: string;
        position: Filter<CellCondition>;
      };
    }
  | {
      type: 'give_gold';
      params: {
        amount: Amount<T>;
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        player: Filter<PlayerCondition>;
      };
    }
  | {
      type: 'transform_unit';
      params: {
        blueprint: CardBlueprintId[];
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'grow';
      params: {
        attack: number;
        hp: number;
        filter?: Filter<GlobalCondition<T>>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
      };
    }
  | {
      type: 'rebirth';
      params: {
        activeWhen?: Filter<GlobalCondition<T>>;
        duration?: 'always' | 'end_of_turn' | 'start_of_next_turn';
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        filter?: Filter<GlobalCondition<T>>;
      };
    }
  | {
      type: 'adapt';
      params: {
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        filter?: Filter<GlobalCondition<T>>;
        choices: Array<{
          effect: CardEffectConfig<Trigger[]>;
          text: string;
        }>;
      };
    }
  | {
      type: 'destroy_cards_in_deck';
      params: {
        card: Filter<
          CardConditionBase | Extract<CardConditionExtras, { type: T['unit'] }>
        >;
        player: Filter<PlayerCondition>;
        execute?: 'now' | 'end_of_turn' | 'start_of_next_turn';
        filter?: Filter<GlobalCondition<T>>;
      };
    };

export type ActionParams<T extends Action['type']> = (Action & {
  type: T;
})['params'];

type TriggerOverridesMap = {
  unit: {
    on_before_unit_move: 'moved_unit';
    on_after_unit_move: 'moved_unit';
    on_before_unit_deal_damage: 'attack_source' | 'attack_target';
    on_after_unit_deal_damage: 'attack_source' | 'attack_target';
    on_before_unit_take_damage: 'attack_source' | 'attack_target';
    on_after_unit_take_damage: 'attack_source' | 'attack_target';
    on_before_unit_attack: 'attack_source' | 'attack_target';
    on_after_unit_attack: 'attack_source' | 'attack_target';
    on_before_unit_retaliate: 'attack_source' | 'attack_target';
    on_after_unit_retaliate: 'attack_source' | 'attack_target';
    on_before_unit_healed: 'healing_source' | 'healing_target';
    on_after_unit_healed: 'healing_source' | 'healing_target';
    on_unit_play: 'played_unit';
    on_before_unit_destroyed: 'destroyed_unit';
    on_after_unit_destroyed: 'destroyed_unit';
  };
  card: {
    on_card_drawn: 'drawn_card';
    on_after_player_draw: 'drawn_card';
    on_card_replaced: 'replaced_card';
    on_before_player_replace: 'replaced_card';
    on_after_player_replace: 'replaced_card' | 'card_replacement';
  };
};

type Intersection<K, U> = K & U;

export type OverridesFromTrigger<T extends Trigger[]> = {
  unit: TriggerOverridesMap['unit'][Intersection<
    T[number]['type'],
    keyof TriggerOverridesMap['unit']
  >];
  card: TriggerOverridesMap['card'][Intersection<
    T[number]['type'],
    keyof TriggerOverridesMap['card']
  >];
};

export type CardEffectConfig<T extends Trigger[]> =
  | {
      executionContext: 'immediate' | 'while_on_board' | 'while_in_hand';
      actions: Action[];
    }
  | {
      executionContext:
        | 'trigger_while_in_hand'
        | 'trigger_while_on_board'
        | 'while_in_deck'
        | 'while_equiped'
        | 'while_in_graveyard';
      triggers: T;
      actions: Action<OverridesFromTrigger<T>>[];
    };

export type VFXStep =
  | {
      type: 'shakeEntity';
      params: {
        entity: Filter<UnitCondition>;
        isBidirectional: boolean;
        amplitude: number;
        duration: number;
      };
    }
  | {
      type: 'shakeScreen';
      params: {
        isBidirectional: boolean;
        amplitude: number;
        duration: number;
      };
    }
  | {
      type: 'playSfxOnEntity';
      params: {
        entity: Filter<UnitCondition>;
        resourceName: string;
        animationName: string;
        offset: Point;
        duration: number;
      };
    }
  | {
      type: 'playSfxOnScreenCenter';
      params: {
        resourceName: string;
        animationName: string;
        offset: Point;
        duration: number;
      };
    }
  | {
      type: 'tintEntity';
      params: {
        entity: Filter<UnitCondition>;
        color: string;
        blendMode: 0 | 1 | 2 | 3;
        alpha: number;
        duration: number;
      };
    }
  | {
      type: 'tintScreen';
      params: {
        color: string;
        blendMode: 0 | 1 | 2 | 3;
        alpha: number;
        duration: number;
      };
    }
  | {
      type: 'addLightOnEntity';
      params: {
        entity: Filter<UnitCondition>;
        color: number;
        offset: Point;
        alpha: number;
        radius: number;
        duration: number;
        blendMode: 0 | 1 | 2 | 3;
      };
    }
  | {
      type: 'bloomScreen';
      params: {
        strength: number;
        duration: number;
      };
    }
  | {
      type: 'bloomEntity';
      params: {
        entity: Filter<UnitCondition>;
        strength: number;
        duration: number;
      };
    }
  | {
      type: 'shockwaveOnEntity';
      params: {
        entity: Filter<UnitCondition>;
        radius: number;
        duration: number;
        wavelength: number;
      };
    }
  | {
      type: 'shockwaveOnScreenCenter';
      params: {
        radius: number;
        duration: number;
        wavelength: number;
        offset: Point;
      };
    }
  | {
      type: 'wait';
      params: {
        duration: number;
      };
    };

export type VFXSequenceTrack = {
  steps: VFXStep[];
  filter: Filter<GlobalCondition>;
};
export type VFXSequence = {
  tracks: VFXSequenceTrack[];
};

export type CardEffect<T extends Trigger[]> = {
  config: CardEffectConfig<T>;
  text: string;
  vfx?: VFXSequence;
};
export type GenericCardEffect = CardEffect<any>;
// used in custom card GUI code
export type WidenedGenericCardEffect = {
  text: string;
  config: {
    executionContext: ExecutionContext;
    triggers?: Array<{
      type: string;
      params: any;
    }>;
    actions: any;
  };
  vfx?: VFXSequence;
};

export type ExecutionContext = GenericCardEffect['config']['executionContext'];

export const defineCardEffect = <T extends Trigger[]>(effect: CardEffect<T>) => effect;

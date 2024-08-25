import type { Nullable, Point3D, AnyObject } from '@game/shared';
import { match } from 'ts-pattern';
import type { Entity } from '../../entity/entity';
import type { GameSession } from '../../game-session';
import type { Card } from '../card';
import { getPlayers, type PlayerCondition } from '../conditions/player-condition';
import {
  type UnitConditionBase,
  type UnitConditionExtras,
  getUnits
} from '../conditions/unit-conditions';
import type { ConditionOverrides, Filter } from '../card-effect';
import {
  getCards,
  type CardConditionBase,
  type CardConditionExtras
} from '../conditions/card-conditions';

export type Amount<T extends ConditionOverrides> =
  | {
      type: 'fixed';
      params: { value: number };
    }
  | {
      type: 'cards_in_hands';
      params: { player: Filter<PlayerCondition> };
    }
  | {
      type: 'attack';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'lowest_attack';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'highest_attack';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'maxHp';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'hp';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'lowest_hp';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'highest_hp';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'cost';
      params: {
        unit: Filter<
          UnitConditionBase | Extract<UnitConditionExtras, { type: T['unit'] }>
        >;
      };
    }
  | {
      type: 'card_played_since_last_turn';
      params: {
        card: Filter<
          CardConditionBase | Extract<CardConditionExtras, { type: T['card'] }>
        >;
        scale: number;
      };
    }
  | {
      type: 'equiped_artifact_count';
      params: {
        player: Filter<PlayerCondition>;
      };
    }
  | {
      type: 'destroyed_units';
      // eslint-disable-next-line @typescript-eslint/ban-types
      params: {};
    }
  | {
      type: 'missing_cards_in_hand';
      // eslint-disable-next-line @typescript-eslint/ban-types
      params: {};
    };

export const getAmount = ({
  amount,
  ...ctx
}: {
  session: GameSession;
  entity?: Entity;
  card: Card;
  amount: Amount<{ unit: UnitConditionExtras['type'] }>;
  targets: Array<Nullable<Point3D>>;
  event: AnyObject;
  eventName?: string;
}): number => {
  return match(amount)
    .with({ type: 'fixed' }, amount => amount.params.value)
    .with({ type: 'cards_in_hands' }, amount => {
      const [player] = getPlayers({ ...ctx, conditions: amount.params.player });
      if (!player) return 0;
      return player.hand.length;
    })
    .with({ type: 'cost' }, amount => {
      const [unit] = getUnits({
        ...ctx,
        conditions: amount.params.unit
      });
      if (!unit) return unit;
      return unit.card.cost;
    })
    .with({ type: 'attack' }, amount => {
      const [unit] = getUnits({
        ...ctx,
        conditions: amount.params.unit
      });
      if (!unit) return unit;
      return unit.attack;
    })
    .with({ type: 'lowest_attack' }, amount => {
      return Math.min(
        ...getUnits({
          ...ctx,
          conditions: amount.params.unit
        }).map(u => u.attack)
      );
    })
    .with({ type: 'highest_attack' }, amount => {
      return Math.max(
        ...getUnits({
          ...ctx,
          conditions: amount.params.unit
        }).map(u => u.attack)
      );
    })
    .with({ type: 'hp' }, amount => {
      const [unit] = getUnits({
        ...ctx,
        conditions: amount.params.unit
      });
      if (!unit) return unit;
      return unit.hp;
    })
    .with({ type: 'maxHp' }, amount => {
      const [unit] = getUnits({
        ...ctx,
        conditions: amount.params.unit
      });
      if (!unit) return unit;
      return unit.maxHp;
    })
    .with({ type: 'lowest_hp' }, amount => {
      return Math.min(
        ...getUnits({
          ...ctx,
          conditions: amount.params.unit
        }).map(u => u.hp)
      );
    })
    .with({ type: 'highest_hp' }, amount => {
      return Math.max(
        ...getUnits({
          ...ctx,
          conditions: amount.params.unit
        }).map(u => u.hp)
      );
    })
    .with({ type: 'card_played_since_last_turn' }, amount => {
      const cards = getCards({ ...ctx, conditions: amount.params.card }).filter(card =>
        ctx.card.player.playedCardSinceLastTurn.includes(card)
      );

      return cards.length * amount.params.scale;
    })
    .with({ type: 'equiped_artifact_count' }, amount => {
      const [player] = getPlayers({ ...ctx, conditions: amount.params.player });

      return player.artifacts.length;
    })
    .with({ type: 'destroyed_units' }, () => {
      return ctx.session.entitySystem
        .getList()
        .filter(e => e.destroyedBy?.equals(ctx.card)).length;
    })
    .with({ type: 'missing_cards_in_hand' }, () => {
      return ctx.session.config.MAX_HAND_SIZE - ctx.card.player.hand.length;
    })
    .exhaustive();
};

export const fixedAmount = (value: number): Amount<Record<string, never>> => {
  return { type: 'fixed', params: { value } };
};

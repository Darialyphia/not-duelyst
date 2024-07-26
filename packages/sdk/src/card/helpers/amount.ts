import type { Nullable, Point3D, AnyObject } from '@game/shared';
import { match } from 'ts-pattern';
import type { Entity } from '../../entity/entity';
import type { GameSession } from '../../game-session';
import type { Card } from '../card';
import type { Amount } from '../card-effect';
import { getPlayers } from '../conditions/player-condition';
import { type UnitConditionExtras, getUnits } from '../conditions/unit-conditions';

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
}) => {
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
    .exhaustive();
};

export const fixedAmount = (value: number): Amount<Record<string, never>> => {
  return { type: 'fixed', params: { value } };
};

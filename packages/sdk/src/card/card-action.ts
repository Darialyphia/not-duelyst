import { match } from 'ts-pattern';
import type { CardBlueprint } from './card-blueprint';
import type { GameSession } from '../game-session';
import type { Action, Amount, Filter, InitAction, NumericOperator } from './card-effect';
import { type Entity } from '../entity/entity';
import { type AnyObject, type Nullable, type Point3D } from '@game/shared';
import type { Card } from './card';
import { type EffectCtx } from './card-parser';
import { airdrop, rush } from '../modifier/modifier-utils';
import type { CardConditionExtras } from './conditions/card-conditions';
import { getPlayers } from './conditions/player-condition';
import { getUnits, type UnitConditionExtras } from './conditions/unit-conditions';
import type { GlobalCondition } from './conditions/global-conditions';
import { getCells } from './conditions/cell-conditions';
import { DealDamageCardAction } from './actions/deal-damage.card-action';
import { HealCardAction } from './actions/heal.card-action';
import { DrawCardAction } from './actions/draw.card-action';
import { ChangeStatsCardAction } from './actions/change-stats.card-action';
import { ChangeDamageTakenAction } from './actions/change-damage-taken.card-action';
import { ChangeHealReceivedAction } from './actions/change-heal-received.card-action';
import { ChangeDamageDealtAction } from './actions/change-damage-dealt.card-action';
import { ProvokeCardAction } from './actions/provoke.card-action';
import { CelerityCardAction } from './actions/celerity.card-action';
import { BackstabCardAction } from './actions/backstab.card-action';
import { AddEffectCardAction } from './actions/add-effect.card-action';
import { ZealCardAction } from './actions/zeal.card-action';
import { DestroyUnitCardAction } from './actions/destroy-unit.card-action';
import { BounceUnitCardAction } from './actions/bounce-unit.card-action';
import { DispelCellCardAction } from './actions/dispel-cell.card-action';
import { ActivateUnitCardAction } from './actions/activate-unit.card-action';

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

export type ParsedActionResult = (
  ctx: EffectCtx,
  event: AnyObject,
  eventName?: string
) => () => void;

const noop = () => void 0;

export const matchNumericOperator = (
  amount: number,
  reference: number,
  operator: NumericOperator
) => {
  return match(operator)
    .with('equals', () => amount === reference)
    .with('less_than', () => amount < reference)
    .with('more_than', () => amount > reference)
    .exhaustive();
};
export const checkGlobalConditions = (
  conditions:
    | Filter<
        GlobalCondition<{
          unit: UnitConditionExtras['type'];
          card: CardConditionExtras['type'];
        }>
      >
    | undefined,
  { session, card, entity, targets }: EffectCtx,
  event: AnyObject,
  eventName?: string
): boolean => {
  if (!conditions) return true;
  if (!conditions.length) return true;

  return conditions.some(group => {
    return group.every(condition => {
      return match(condition)
        .with({ type: 'player_gold' }, condition => {
          const amount = getAmount({
            session,
            card,
            entity,
            targets,
            event,
            eventName,
            amount: condition.params.amount
          });
          return getPlayers({
            session,
            card,
            event,
            eventName,
            targets,
            conditions: condition.params.player
          }).every(player =>
            matchNumericOperator(player.currentGold, amount, condition.params.operator)
          );
        })
        .with({ type: 'player_hp' }, condition => {
          const amount = getAmount({
            session,
            card,
            entity,
            targets,
            event,
            eventName,
            amount: condition.params.amount
          });
          return getPlayers({
            session,
            card,
            event,
            eventName,
            targets,

            conditions: condition.params.player
          }).every(player =>
            matchNumericOperator(player.general.hp, amount, condition.params.operator)
          );
        })
        .with({ type: 'unit_state' }, condition => {
          const entities = getUnits({
            session,
            entity,
            targets,
            card,
            event,
            eventName,
            conditions: condition.params.unit
          });
          const isMatch = (e: Entity) => {
            const { attack, hp, position } = condition.params;
            const ctx = { session, card, entity, targets, event, eventName };
            const attackMatch = attack
              ? matchNumericOperator(
                  getAmount({
                    ...ctx,
                    amount: attack.amount
                  }),
                  e.attack,
                  attack.operator
                )
              : true;

            const hpMatch = hp
              ? matchNumericOperator(
                  getAmount({
                    ...ctx,
                    amount: hp.amount
                  }),
                  e.hp,
                  hp.operator
                )
              : true;

            const positionMatch = position
              ? getCells({ ...ctx, conditions: position }).some(cell => {
                  return cell.position.equals(e.position);
                })
              : true;

            return attackMatch && hpMatch && positionMatch;
          };

          return match(condition.params.mode)
            .with('all', () => entities.every(isMatch))
            .with('none', () => entities.every(e => !isMatch(e)))
            .with('some', () => entities.some(isMatch))
            .exhaustive();
        })
        .exhaustive();
    });
  });
};

export const parseCardAction = (action: Action): ParsedActionResult => {
  return (ctx, event, eventName) => {
    const { session, card, entity, targets } = ctx;

    return match(action)
      .with({ type: 'deal_damage' }, action => {
        return new DealDamageCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'heal' }, action => {
        return new HealCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'draw_cards' }, action => {
        return new DrawCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'change_stats' }, action => {
        return new ChangeStatsCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'change_damage_taken' }, action => {
        return new ChangeDamageTakenAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'change_heal_received' }, action => {
        return new ChangeHealReceivedAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'change_damage_dealt' }, action => {
        return new ChangeDamageDealtAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'provoke' }, action => {
        return new ProvokeCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'celerity' }, action => {
        return new CelerityCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'backstab' }, action => {
        return new BackstabCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'add_effect' }, action => {
        return new AddEffectCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'zeal' }, action => {
        return new ZealCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'destroy_unit' }, action => {
        return new DestroyUnitCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'bounce_unit' }, action => {
        return new BounceUnitCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'dispel_cell' }, action => {
        return new DispelCellCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'activate_unit' }, action => {
        return new ActivateUnitCardAction(action, ctx, event, eventName).execute();
      })
      .exhaustive();
  };
};

export const parseCardInitAction = (action: InitAction) => {
  return ({ blueprint }: { blueprint: CardBlueprint }) => {
    return match(action)
      .with({ type: 'airdrop' }, () => {
        if (!blueprint.modifiers) {
          blueprint.modifiers = [];
        }
        blueprint.modifiers.push(airdrop());

        return noop;
      })
      .with({ type: 'rush' }, () => {
        if (!blueprint.modifiers) {
          blueprint.modifiers = [];
        }
        blueprint.modifiers.push(rush());

        return noop;
      })
      .exhaustive();
  };
};

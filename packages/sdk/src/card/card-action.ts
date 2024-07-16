import { match } from 'ts-pattern';
import type { CardBlueprint } from './card-blueprint';
import type { GameSession } from '../game-session';
import type { Action, Amount, Filter, InitAction, NumericOperator } from './card-effect';
import type { Entity } from '../entity/entity';
import type { AnyObject, Nullable, Point3D } from '@game/shared';
import type { Card } from './card';
import { createEntityModifier } from '../modifier/entity-modifier';
import { modifierEntityInterceptorMixin } from '../modifier/mixins/entity-interceptor.mixin';
import { nanoid } from 'nanoid';
import {
  getEffectModifier,
  parseSerializedBlueprintEffect,
  type EffectCtx
} from './card-parser';
import { airdrop, provoke, rush } from '../modifier/modifier-utils';
import type { CardConditionExtras } from './conditions/card-conditions';
import { getPlayers } from './conditions/player-condition';
import { getUnits, type UnitConditionExtras } from './conditions/unit-conditions';
import type { GlobalCondition } from './conditions/global-conditions';
import { getCells } from './conditions/cell-conditions';

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

const matchNumericOperator = (
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
const checkGlobalConditions = (
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
          return getPlayers({ session, card, conditions: condition.params.player }).every(
            player =>
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
            const { state } = condition.params;
            const ctx = { session, card, entity, targets, event, eventName };
            const attackMatch = state.attack
              ? matchNumericOperator(
                  getAmount({
                    ...ctx,
                    amount: state.attack.amount
                  }),
                  e.attack,
                  state.attack.operator
                )
              : true;

            const hpMatch = state.hp
              ? matchNumericOperator(
                  getAmount({
                    ...ctx,
                    amount: state.hp.amount
                  }),
                  e.hp,
                  state.hp.operator
                )
              : true;

            const positionMatch = state.position
              ? getCells({ ...ctx, conditions: state.position }).some(cell => {
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
  return ({ session, card, entity, targets }, event, eventName) => {
    return match(action)
      .with({ type: 'deal_damage' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          { session, card, entity, targets },
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;

        getUnits({
          session,
          entity,
          card,
          targets,
          conditions: action.params.targets,
          event,
          eventName
        }).forEach(target => {
          target.takeDamage(
            getAmount({
              session,
              entity,
              card,
              targets,
              amount: action.params.amount,
              event,
              eventName
            })
          );
        });

        return noop;
      })
      .with({ type: 'heal' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          { session, card, entity, targets },
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;
        getUnits({
          session,
          entity,
          card,
          targets,
          conditions: action.params.targets,
          event,
          eventName
        }).forEach(target => {
          target.heal(
            getAmount({
              session,
              entity,
              card,
              targets,
              amount: action.params.amount,
              event,
              eventName
            })
          );
        });

        return noop;
      })
      .with({ type: 'draw_cards' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          { session, card, entity, targets },
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;
        getPlayers({
          session,
          card,
          conditions: action.params.player
        }).forEach(player => {
          player.draw(
            getAmount({
              session,
              entity,
              card,
              targets,
              amount: action.params.amount,
              event,
              eventName
            })
          );
        });

        return noop;
      })
      .with({ type: 'change_stats' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          { session, card, entity, targets },
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;
        const modifierId = nanoid(6);
        const units = getUnits({
          session,
          entity,
          card,
          targets,
          conditions: action.params.targets,
          event,
          eventName
        });

        units.forEach(target => {
          target.addModifier(
            createEntityModifier({
              id: modifierId,
              source: entity ?? card.player.general,
              stackable: action.params.stackable,
              visible: false,
              mixins: [
                modifierEntityInterceptorMixin({
                  key: 'attack',
                  keywords: [],
                  interceptor: () => value => {
                    const shouldApply = checkGlobalConditions(
                      action.params.attack.activeWhen,
                      { session, card, entity, targets },
                      event,
                      eventName
                    );
                    if (!shouldApply) return value;
                    return (
                      value +
                      getAmount({
                        session,
                        entity,
                        card,
                        targets,
                        amount: action.params.attack.amount,
                        event,
                        eventName
                      })
                    );
                  }
                }),
                modifierEntityInterceptorMixin({
                  key: 'maxHp',
                  keywords: [],
                  interceptor: () => value => {
                    const shouldApply = checkGlobalConditions(
                      action.params.hp.activeWhen,
                      { session, card, entity, targets },
                      event,
                      eventName
                    );
                    if (!shouldApply) return value;
                    return (
                      value +
                      getAmount({
                        session,
                        entity,
                        card,
                        targets,
                        amount: action.params.hp.amount,
                        event,
                        eventName
                      })
                    );
                  }
                })
              ]
            })
          );
        });

        return () =>
          units.forEach(target => {
            target.removeModifier(modifierId);
          });
      })
      .with({ type: 'provoke' }, () => {
        const source = entity ?? card.player.general;
        const modifier = provoke({ source });
        source.addModifier(modifier);
        return () => {
          source.removeModifier(modifier.id);
        };
      })
      .with({ type: 'add_effect' }, action => {
        const units = getUnits({
          session,
          entity,
          card,
          targets,
          event,
          eventName,
          conditions: action.params.unit
        });
        const actions = parseSerializedBlueprintEffect({
          text: '',
          config: action.params.effect
        }).flat();
        units.forEach(unit => {
          actions.forEach(action => {
            const entityModifier = action.getEntityModifier?.({
              session,
              entity,
              card,
              targets: []
            });
            if (entityModifier) {
              unit.addModifier(entityModifier);
            }

            const cardModifier = action.getCardModifier?.();
            if (cardModifier) {
              unit.card.addModifier(cardModifier);
            }
          });
        });
        return noop;
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

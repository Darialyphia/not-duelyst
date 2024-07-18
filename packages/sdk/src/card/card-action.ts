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
import { parseSerializedBlueprintEffect, type EffectCtx } from './card-parser';
import { airdrop, celerity, provoke, rush } from '../modifier/modifier-utils';
import type { CardConditionExtras } from './conditions/card-conditions';
import { getPlayers } from './conditions/player-condition';
import { getUnits, type UnitConditionExtras } from './conditions/unit-conditions';
import type { GlobalCondition } from './conditions/global-conditions';
import { getCells } from './conditions/cell-conditions';
import { applyModifierConditionally } from './helpers/actions';

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
  return (ctx, event, eventName) => {
    const { session, card, entity } = ctx;

    return match(action)
      .with({ type: 'deal_damage' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;

        getUnits({
          ...ctx,
          conditions: action.params.targets,
          event,
          eventName
        }).forEach(target => {
          target.takeDamage(
            getAmount({
              ...ctx,
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
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;
        getUnits({
          ...ctx,
          conditions: action.params.targets,
          event,
          eventName
        }).forEach(target => {
          target.heal(
            getAmount({
              ...ctx,
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
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;
        getPlayers({
          ...ctx,
          event,
          eventName,
          conditions: action.params.player
        }).forEach(player => {
          player.draw(
            getAmount({
              ...ctx,
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
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;
        const modifierId = nanoid(6);
        const units = getUnits({
          ...ctx,
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
                    if (!action.params.attack) return value;
                    const shouldApply = checkGlobalConditions(
                      action.params.attack.activeWhen,
                      ctx,
                      event,
                      eventName
                    );
                    if (!shouldApply) return value;
                    const amount = getAmount({
                      ...ctx,
                      amount: action.params.attack.amount,
                      event,
                      eventName
                    });
                    return match(action.params.mode)
                      .with('give', () => value + amount)
                      .with('set', () => amount)
                      .exhaustive();
                  }
                }),
                modifierEntityInterceptorMixin({
                  key: 'maxHp',
                  keywords: [],
                  interceptor: () => value => {
                    if (!action.params.hp) return value;
                    const shouldApply = checkGlobalConditions(
                      action.params.hp.activeWhen,
                      ctx,
                      event,
                      eventName
                    );
                    if (!shouldApply) return value;
                    const amount = getAmount({
                      ...ctx,
                      amount: action.params.hp.amount,
                      event,
                      eventName
                    });
                    return match(action.params.mode)
                      .with('give', () => value + amount)
                      .with('set', () => amount)
                      .exhaustive();
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
      .with({ type: 'provoke' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;
        const source = entity ?? card.player.general;
        const modifier = provoke({ source });

        return applyModifierConditionally({
          modifier,
          ctx,
          event,
          eventName,
          session,
          conditions: action.params.activeWhen
        });
      })
      .with({ type: 'celerity' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;
        const source = entity ?? card.player.general;
        const modifier = celerity({ source });

        const tryToApply = () => {
          const shouldApply = checkGlobalConditions(
            action.params.activeWhen,
            ctx,
            event,
            eventName
          );

          if (shouldApply) {
            if (!source.hasModifier(modifier.id)) {
              source.addModifier(modifier);
            }
          } else {
            source.removeModifier(modifier.id);
          }
        };

        tryToApply();
        session.on('*', tryToApply);

        return () => {
          source.removeModifier(modifier.id);
          session.off('*', tryToApply);
        };
      })
      .with({ type: 'add_effect' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;
        const units = getUnits({
          ...ctx,
          event,
          eventName,
          conditions: action.params.unit
        });
        const effects = parseSerializedBlueprintEffect({
          text: '',
          config: action.params.effect
        }).flat();
        units.forEach(unit => {
          effects.forEach(effect => {
            const entityModifier = effect.getEntityModifier?.({
              session,
              entity: unit,
              card: unit.card,
              targets: []
            });
            if (entityModifier) {
              unit.addModifier(entityModifier);
            }

            const cardModifier = effect.getCardModifier?.();

            if (cardModifier) {
              unit.card.addModifier(cardModifier);
            }
          });
        });
        return noop;
      })
      .with({ type: 'destroy_unit' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;

        getUnits({
          ...ctx,
          event,
          eventName,
          conditions: action.params.targets
        }).forEach(unit => {
          unit.destroy();
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

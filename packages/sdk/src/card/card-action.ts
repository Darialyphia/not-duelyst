import { match } from 'ts-pattern';
import type { CardBlueprint } from './card-blueprint';
import type { GameSession } from '../game-session';
import type { Action, Amount, Filter, InitAction, NumericOperator } from './card-effect';
import { ENTITY_EVENTS, type Entity } from '../entity/entity';
import { type AnyObject, type Nullable, type Point3D } from '@game/shared';
import type { Card } from './card';
import { createEntityModifier } from '../modifier/entity-modifier';
import { modifierEntityInterceptorMixin } from '../modifier/mixins/entity-interceptor.mixin';
import { nanoid } from 'nanoid';
import { parseSerializedBlueprintEffect, type EffectCtx } from './card-parser';
import {
  airdrop,
  backstab,
  celerity,
  dispelCell,
  provoke,
  rush,
  zeal
} from '../modifier/modifier-utils';
import type { CardConditionExtras } from './conditions/card-conditions';
import { getPlayers } from './conditions/player-condition';
import { getUnits, type UnitConditionExtras } from './conditions/unit-conditions';
import type { GlobalCondition } from './conditions/global-conditions';
import { getCells } from './conditions/cell-conditions';
import { applyModifierConditionally } from './helpers/actions';
import { Unit } from './unit';

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
          if (ctx.card instanceof Unit) {
            ctx.card.entity.dealDamage(
              getAmount({
                ...ctx,
                amount: action.params.amount,
                event,
                eventName
              }),
              target
            );
          } else {
            target.takeDamage(
              getAmount({
                ...ctx,
                amount: action.params.amount,
                event,
                eventName
              }),
              ctx.card
            );
          }
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
            }),
            ctx.card
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
          const stats = {
            attack: action.params.attack
              ? getAmount({
                  ...ctx,
                  amount: action.params.attack.amount,
                  event,
                  eventName
                })
              : 0,
            hp: action.params.hp
              ? getAmount({
                  ...ctx,
                  amount: action.params.hp.amount,
                  event,
                  eventName
                })
              : 0
          };
          target.addModifier(
            createEntityModifier({
              id: modifierId,
              source: card,
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
                      .with('set', () => stats.attack)
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
                      .with('set', () => stats.hp)
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
      .with({ type: 'change_damage_taken' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;

        const units = getUnits({
          ...ctx,
          conditions: action.params.targets,
          event,
          eventName
        });
        const modifierId = nanoid(6);

        units.forEach(target => {
          let shouldApply = true;
          target.addModifier(
            createEntityModifier({
              id: modifierId,
              source: card,
              stackable: action.params.stackable,
              visible: false,
              mixins: [
                modifierEntityInterceptorMixin({
                  key: 'damageTaken',
                  keywords: [],
                  interceptor: () => value => {
                    if (!shouldApply) return value;
                    const amount = getAmount({
                      ...ctx,
                      amount: action.params.amount,
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
          if (action.params.frequency.type === 'once') {
            target.once(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, () => {
              target.removeModifier(modifierId);
            });
          }
          if (action.params.frequency.type === 'n_per_turn') {
            const maxPerTurn = action.params.frequency.params.count;
            let count = 0;

            target.on(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, () => {
              count++;
              if (count >= maxPerTurn) {
                shouldApply = false;
              }
            });
            session.on('player:turn_start', () => {
              count = 0;
              shouldApply = true;
            });
          }
        });

        return () =>
          units.forEach(target => {
            target.removeModifier(modifierId);
          });
      })
      .with({ type: 'change_heal_received' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;

        const units = getUnits({
          ...ctx,
          conditions: action.params.targets,
          event,
          eventName
        });
        const modifierId = nanoid(6);

        units.forEach(target => {
          let shouldApply = true;
          target.addModifier(
            createEntityModifier({
              id: modifierId,
              source: card,
              stackable: action.params.stackable,
              visible: false,
              mixins: [
                modifierEntityInterceptorMixin({
                  key: 'healReceived',
                  keywords: [],
                  interceptor: () => value => {
                    if (!shouldApply) return value;
                    const amount = getAmount({
                      ...ctx,
                      amount: action.params.amount,
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
          if (action.params.frequency.type === 'once') {
            target.once(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, () => {
              target.removeModifier(modifierId);
            });
          }
          if (action.params.frequency.type === 'n_per_turn') {
            const maxPerTurn = action.params.frequency.params.count;
            let count = 0;

            target.on(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, () => {
              count++;
              if (count >= maxPerTurn) {
                shouldApply = false;
              }
            });
            session.on('player:turn_start', () => {
              count = 0;
              shouldApply = true;
            });
          }
        });
        return () =>
          units.forEach(target => {
            target.removeModifier(modifierId);
          });
      })
      .with({ type: 'change_damage_dealt' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;

        const units = getUnits({
          ...ctx,
          conditions: action.params.targets,
          event,
          eventName
        });
        const modifierId = nanoid(6);

        units.forEach(target => {
          let shouldApply = true;
          target.addModifier(
            createEntityModifier({
              id: modifierId,
              source: card,
              stackable: action.params.stackable,
              visible: false,
              mixins: [
                modifierEntityInterceptorMixin({
                  key: 'damageDealt',
                  keywords: [],
                  interceptor: () => value => {
                    if (!shouldApply) return value;
                    const amount = getAmount({
                      ...ctx,
                      amount: action.params.amount,
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
          if (action.params.frequency.type === 'once') {
            target.once(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, () => {
              target.removeModifier(modifierId);
            });
          }
          if (action.params.frequency.type === 'n_per_turn') {
            const maxPerTurn = action.params.frequency.params.count;
            let count = 0;

            target.on(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, () => {
              count++;
              if (count >= maxPerTurn) {
                shouldApply = false;
              }
            });
            session.on('player:turn_start', () => {
              count = 0;
              shouldApply = true;
            });
          }
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

        const modifier = provoke({ source: card });

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
        const modifier = celerity({ source: card });

        return applyModifierConditionally({
          modifier,
          ctx,
          event,
          eventName,
          session,
          conditions: action.params.activeWhen
        });
      })
      .with({ type: 'backstab' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;
        const attackBonus = getAmount({
          ...ctx,
          event,
          eventName,
          amount: action.params.amount
        });
        const modifier = backstab({ source: card, attackBonus });
        return applyModifierConditionally({
          modifier,
          ctx,
          event,
          eventName,
          session,
          conditions: action.params.activeWhen
        });
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
            if (effect.onPlay) {
              effect.onPlay({
                session,
                entity: unit,
                card: unit.card,
                targets: []
              });
            }
            if (effect.getEntityModifier) {
              unit.addModifier(
                effect.getEntityModifier({
                  session,
                  entity: unit,
                  card: unit.card,
                  targets: []
                })
              );
            }

            if (effect.getCardModifier) {
              unit.card.addModifier(effect.getCardModifier());
            }
          });
        });
        return noop;
      })
      .with({ type: 'zeal' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;
        const cleanups: Array<() => void> = [];
        const zealTarget = entity ?? card.player.general;
        const effects = parseSerializedBlueprintEffect({
          text: '',
          config: action.params.effect
        }).flat();

        effects.forEach(effect => {
          if (effect.onPlay) {
            let cleanup: (() => void) | undefined;
            const modifier = zeal({
              source: card,
              onGainAura(entity, zealed, session) {
                cleanup = effect.onPlay?.({
                  session,
                  card,
                  entity: zealed,
                  targets
                });
              },
              onLoseAura() {
                cleanup?.();
              }
            });
            zealTarget.addModifier(modifier);
            cleanups.push(() => zealTarget.removeModifier(modifier.id));
          }

          if (effect.getEntityModifier) {
            const entityModifier = effect.getEntityModifier?.({
              session,
              entity: zealTarget,
              card: zealTarget.card,
              targets: []
            });
            const zealModifier = zeal({
              source: card,
              onGainAura() {
                zealTarget.addModifier(entityModifier);
              },
              onLoseAura() {
                zealTarget.removeModifier(entityModifier.id);
              }
            });
            zealTarget.addModifier(zealModifier);
            cleanups.push(() => zealTarget.removeModifier(zealModifier.id));
          }
        });

        return () => cleanups.forEach(cleanup => cleanup());
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
      .with({ type: 'dispel_cell' }, action => {
        const isGlobalConditionMatch = checkGlobalConditions(
          action.params.filter,
          ctx,
          event,
          eventName
        );
        if (!isGlobalConditionMatch) return noop;

        const cells = getCells({
          ...ctx,
          conditions: action.params.cells,
          event,
          eventName
        });

        cells.forEach(cell => {
          dispelCell(cell);
        });
        return noop;
      })
      .with({ type: 'activate_unit' }, action => {
        const units = getUnits({
          ...ctx,
          conditions: action.params.targets,
          event,
          eventName
        });

        units.forEach(unit => unit.activate());

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

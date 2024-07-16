import { match } from 'ts-pattern';
import type { CardBlueprint } from './card-blueprint';
import type { GameSession } from '../game-session';
import type { Action, Amount, Filter, InitAction, NumericOperator } from './card-effect';
import type { Entity } from '../entity/entity';
import type { AnyObject, Nullable, Point3D } from '@game/shared';
import { isWithinCells } from '../utils/targeting';
import type { Card } from './card';
import type { Player } from '../player/player';
import { createEntityModifier } from '../modifier/entity-modifier';
import { modifierEntityInterceptorMixin } from '../modifier/mixins/entity-interceptor.mixin';
import { nanoid } from 'nanoid';
import { CARD_KINDS } from './card-enums';
import type { EffectCtx } from './card-parser';
import {
  getCellAbove,
  getCellBehind,
  getCellBelow,
  getCellInFront,
  getEntityAbove,
  getEntityBehind,
  getEntityBelow,
  getEntityInFront,
  getNearest
} from '../entity/entity-utils';
import type { Cell } from '../board/cell';
import { airdrop, rush } from '../modifier/modifier-utils';
import type { CardCondition, CardConditionExtras } from './conditions/card-conditions';
import type { CellCondition } from './conditions/cell-conditions';
import type { PlayerCondition } from './conditions/player-condition';
import type { UnitCondition, UnitConditionExtras } from './conditions/unit-conditions';
import type { GlobalCondition } from './conditions/global-conditions';

export const getUnits = ({
  session,
  entity,
  conditions,
  targets,
  event,
  card,
  eventName
}: {
  session: GameSession;
  entity?: Entity;
  card: Card;
  conditions: Filter<UnitCondition>;
  targets: Array<Nullable<Point3D>>;
  event: AnyObject;
  eventName?: string;
}): Entity[] =>
  session.entitySystem.getList().filter(e => {
    if (!conditions.length) return true;

    return conditions.some(group => {
      return group.every(condition => {
        const isMatch = match(condition)
          .with({ type: 'any_unit' }, () => true)
          .with({ type: 'has_keyword' }, () => false /*TODO*/)
          .with({ type: 'is_ally' }, () => card.player.equals(e.player))
          .with({ type: 'is_enemy' }, () => !card.player.equals(e.player))
          .with({ type: 'is_manual_target' }, condition => {
            const point = targets[condition.params.index];
            if (!point) return false;
            const entity = session.entitySystem.getEntityAt(point);
            if (!entity) return false;
            return e.equals(entity);
          })
          .with({ type: 'is_general' }, () => e.isGeneral)
          .with({ type: 'is_minion' }, () => !e.isGeneral)
          .with({ type: 'is_self' }, () => {
            if (!entity) return false;
            return entity.equals(e);
          })
          .with({ type: 'is_nearby' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(
              candidate =>
                isWithinCells(candidate.position, e.position, 1) &&
                !candidate.position.equals(e.position)
            );
          })
          .with({ type: 'is_in_front' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getEntityInFront(session, candidate)?.equals(e)
            );
          })
          .with({ type: 'is_nearest_in_front' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getNearest(
                session,
                candidate.player.isPlayer1 ? 'right' : 'left',
                candidate.position
              )?.equals(e)
            );
          })
          .with({ type: 'is_behind' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getEntityBehind(session, candidate)?.equals(e)
            );
          })
          .with({ type: 'is_nearest_behind' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getNearest(
                session,
                candidate.player.isPlayer1 ? 'left' : 'right',
                candidate.position
              )?.equals(e)
            );
          })
          .with({ type: 'is_above' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getEntityAbove(session, candidate)?.equals(e)
            );
          })
          .with({ type: 'is_nearest_above' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getNearest(session, 'up', candidate.position)?.equals(e)
            );
          })
          .with({ type: 'is_below' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getEntityBelow(session, candidate)?.equals(e)
            );
          })
          .with({ type: 'is_nearest_below' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getNearest(session, 'down', candidate.position)?.equals(e)
            );
          })
          .with({ type: 'moved_unit' }, () => {
            return e.equals(event.entity);
          })
          .with({ type: 'destroyed_unit' }, () => {
            return e.equals(event as Entity);
          })
          .with({ type: 'played_unit' }, () => {
            return e.equals(event as Entity);
          })
          .with({ type: 'healing_source' }, () => {
            return event.source && e.equals(event.source);
          })
          .with({ type: 'healing_target' }, () => {
            return event.entity && e.equals(event.entity);
          })
          .with({ type: 'attack_source' }, () => {
            if (
              eventName === 'entity:before_attack' ||
              eventName === 'entity:after_attack' ||
              eventName === 'entity:before_retaliate' ||
              eventName === 'entity:after_retaliate' ||
              eventName === 'entity:before_deal_damage' ||
              eventName === 'entity:after_deal_damage'
            ) {
              return event.entity && e.equals(event.entity);
            }

            if (
              eventName === 'entity:before_take_damage' ||
              eventName === 'entity:after_take_damage'
            ) {
              return event.source && e.equals(event.source);
            }

            return false;
          })
          .with({ type: 'attack_target' }, () => {
            if (
              eventName === 'entity:before_attack' ||
              eventName === 'entity:after_attack' ||
              eventName === 'entity:before_retaliate' ||
              eventName === 'entity:after_retaliate' ||
              eventName === 'entity:before_deal_damage' ||
              eventName === 'entity:after_deal_damage'
            ) {
              return event.target && e.equals(event.target);
            }

            if (
              eventName === 'entity:before_take_damage' ||
              eventName === 'entity:after_take_damage'
            ) {
              return event.entity && e.equals(event.entity);
            }

            return false;
          })
          .exhaustive();
        return isMatch;
      });
    });
  });

export const getCells = ({
  session,
  entity,
  card,
  conditions,
  targets,
  event,
  eventName
}: {
  session: GameSession;
  entity?: Entity;
  card: Card;
  conditions: Filter<CellCondition>;
  targets: Array<Nullable<Point3D>>;
  event: AnyObject;
  eventName?: string;
}): Cell[] =>
  session.boardSystem.cells.filter(cell => {
    return conditions.some(group => {
      return group.every(condition => {
        return match(condition)
          .with({ type: 'any_cell' }, () => true)
          .with({ type: 'is_manual_target' }, condition => {
            const point = targets[condition.params.index];
            if (!point) return false;
            return cell.position.equals(point);
          })
          .with({ type: 'is_empty' }, () => !cell.entity)
          .with({ type: 'is_nearby' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              isWithinCells(candidate.position, cell.position, 1)
            );
          })
          .with({ type: 'is_in_front' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getCellInFront(session, candidate)?.equals(cell)
            );
          })
          .with({ type: 'is_behind' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getCellBehind(session, candidate)?.equals(cell)
            );
          })
          .with({ type: 'is_above' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getCellAbove(session, candidate)?.equals(cell)
            );
          })
          .with({ type: 'is_below' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
              card,
              event,
              eventName
            });
            return candidates.some(candidate =>
              getCellBelow(session, candidate)?.equals(cell)
            );
          })
          .with({ type: 'is_at' }, condition => cell.position.equals(condition.params))
          .with(
            { type: 'is_top_left_corner' },
            () => cell.x === 0 && cell.y === 0 && cell.isTopMost
          )
          .with(
            { type: 'is_top_right_corner' },
            () =>
              cell.x === session.boardSystem.width - 1 && cell.y === 0 && cell.isTopMost
          )
          .with(
            { type: 'is_bottom_left_corner' },
            () =>
              cell.x === 0 && cell.y === session.boardSystem.height - 1 && cell.isTopMost
          )
          .with(
            { type: 'is_bottom_right_corner' },
            () =>
              cell.x === session.boardSystem.width - 1 &&
              cell.y === session.boardSystem.height - 1 &&
              cell.isTopMost
          )
          .with({ type: 'has_unit' }, condition => {
            if (!cell.entity) return false;

            return getUnits({
              session,
              entity,
              card,
              conditions: condition.params.unit,
              targets,
              event,
              eventName
            }).some(unit => cell.entity?.equals(unit));
          })
          .with({ type: 'moved_unit_new_position' }, () => {
            return session.boardSystem.getCellAt(event.entity.position)?.equals(cell);
          })
          .with({ type: 'moved_unit_old_position' }, () => {
            if (eventName === 'entity:before-move') {
              return session.boardSystem.getCellAt(event.entity.position)?.equals(cell);
            }
            if (eventName === 'entity:-after-move') {
              return session.boardSystem.getCellAt(event.previousPosition)?.equals(cell);
            }
            return false;
          })
          .with({ type: 'moved_path' }, () => {
            return event.path.some((point: Point3D) =>
              session.boardSystem.getCellAt(point)?.equals(cell)
            );
          })
          .with({ type: 'attack_source_position' }, () => {
            return false;
          })
          .with({ type: 'attack_target_position' }, () => {
            return false;
          })
          .with({ type: 'heal_source_position' }, () => {
            return false;
          })
          .with({ type: 'heal_target_position' }, () => {
            return false;
          })
          .exhaustive();
      });
    });
  });

export const getPlayers = ({
  session,
  card,
  conditions
}: {
  session: GameSession;
  card: Card;
  conditions: Filter<PlayerCondition>;
}): Player[] =>
  session.playerSystem.getList().filter(p => {
    return conditions.some(group => {
      return group.every(condition => {
        return match(condition)
          .with({ type: 'ally_player' }, () => card.player.equals(p))
          .with({ type: 'enemy_player' }, () => card.player.opponent.equals(p))
          .with({ type: 'any_player' }, () => true)
          .exhaustive();
      });
    });
  });

export const getCards = ({
  session,
  card,
  conditions,
  entity,
  targets,
  event,
  eventName
}: {
  session: GameSession;
  card: Card;
  conditions: Filter<CardCondition>;
  targets: Array<Nullable<Point3D>>;
  entity?: Entity;
  event: AnyObject;
  eventName?: string;
}) =>
  session.playerSystem
    .getList()
    .map(player => player.cards)
    .flat()
    .filter(c => {
      return conditions.some(group => {
        return group.every(condition => {
          return match(condition)
            .with({ type: 'any_card' }, () => true)
            .with({ type: 'artifact' }, () => c.kind === CARD_KINDS.ARTIFACT)
            .with({ type: 'spell' }, () => c.kind === CARD_KINDS.SPELL)
            .with({ type: 'minion' }, () => c.kind === CARD_KINDS.MINION)
            .with({ type: 'cost' }, condition => {
              const amount = getAmount({
                session,
                entity,
                card,
                targets,
                amount: condition.params.amount,
                event,
                eventName
              });
              return match(condition.params.operator)
                .with('equals', () => c.cost === amount)
                .with('less_than', () => c.cost < amount)
                .with('more_than', () => c.cost > amount)
                .exhaustive();
            })
            .with(
              { type: 'index_in_hand' },
              condition => c.player.hand[condition.params.index] === card
            )
            .with({ type: 'self' }, () => c === card)
            .with({ type: 'drawn_card' }, () => {
              if (eventName === 'card:drawn') {
                return c === event;
              }
              if (eventName === 'player:after_draw') {
                event.cards.some((drawnCard: Card) => drawnCard === c);
              }

              return false;
            })
            .with({ type: 'replaced_card' }, () => {
              if (eventName === 'card:replaced') {
                return c === event;
              }
              if (
                eventName === 'player:before_replace' ||
                eventName === 'player:after_replace'
              ) {
                event.replacedCard === c;
              }

              return false;
            })
            .with({ type: 'card_replacement' }, () => {
              return event.replacement === c;
            })
            .exhaustive();
        });
      });
    });

const getAmount = ({
  session,
  entity,
  card,
  amount,
  targets,
  event,
  eventName
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
      const [player] = getPlayers({ session, card, conditions: amount.params.player });
      if (!player) return 0;
      return player.hand.length;
    })
    .with({ type: 'cost' }, amount => {
      const [unit] = getUnits({
        session,
        entity,
        targets,
        card,
        conditions: amount.params.unit,
        event,
        eventName
      });
      if (!unit) return unit;
      return unit.card.cost;
    })
    .with({ type: 'attack' }, amount => {
      const [unit] = getUnits({
        session,
        entity,
        card,
        targets,
        conditions: amount.params.unit,
        event,
        eventName
      });
      if (!unit) return unit;
      return unit.attack;
    })
    .with({ type: 'lowest_attack' }, amount => {
      return Math.min(
        ...getUnits({
          session,
          entity,
          card,
          targets,
          conditions: amount.params.unit,
          event,
          eventName
        }).map(u => u.attack)
      );
    })
    .with({ type: 'highest_attack' }, amount => {
      return Math.max(
        ...getUnits({
          session,
          entity,
          card,
          targets,
          conditions: amount.params.unit,
          event,
          eventName
        }).map(u => u.attack)
      );
    })
    .with({ type: 'hp' }, amount => {
      const [unit] = getUnits({
        session,
        entity,
        card,
        targets,
        conditions: amount.params.unit,
        event,
        eventName
      });
      if (!unit) return unit;
      return unit.hp;
    })
    .with({ type: 'lowest_hp' }, amount => {
      return Math.min(
        ...getUnits({
          session,
          entity,
          card,
          targets,
          conditions: amount.params.unit,
          event,
          eventName
        }).map(u => u.hp)
      );
    })
    .with({ type: 'highest_hp' }, amount => {
      return Math.max(
        ...getUnits({
          session,
          entity,
          card,
          targets,
          conditions: amount.params.unit,
          event,
          eventName
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

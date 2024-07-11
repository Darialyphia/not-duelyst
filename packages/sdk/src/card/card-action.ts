import { match } from 'ts-pattern';
import type { CardBlueprint } from './card-blueprint';
import type { GameSession } from '../game-session';
import type {
  Action,
  Amount,
  CardCondition,
  CellCondition,
  Filter,
  InitAction,
  PlayerCondition,
  UnitCondition,
  UnitConditionExtras
} from './card-effect';
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

export const getUnits = ({
  session,
  entity,
  conditions,
  targets,
  event,
  eventName
}: {
  session: GameSession;
  entity?: Entity;
  conditions: Filter<UnitCondition>;
  targets: Array<Nullable<Point3D>>;
  event: AnyObject;
  eventName?: string;
}): Entity[] =>
  session.entitySystem.getList().filter(e => {
    return conditions.some(group => {
      return group.every(condition => {
        const isMatch = match(condition)
          .with({ type: 'has_keyword' }, () => false /*TODO*/)
          .with({ type: 'is_ally' }, () => entity?.isAlly(e.id))
          .with({ type: 'is_enemy' }, () => entity?.isEnemy(e.id))
          .with({ type: 'is_followup' }, condition => {
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
              event,
              eventName
            });
            return candidates.some(candidate =>
              isWithinCells(candidate.position, e.position, 1)
            );
          })
          .with({ type: 'is_in_front' }, condition => {
            const candidates = getUnits({
              conditions: condition.params.unit,
              targets,
              session,
              entity,
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
  conditions,
  targets,
  event,
  eventName
}: {
  session: GameSession;
  entity?: Entity;
  conditions: Filter<CellCondition>;
  targets: Array<Nullable<Point3D>>;
  event: AnyObject;
  eventName?: string;
}): Cell[] =>
  session.boardSystem.cells.filter(cell => {
    return conditions.some(group => {
      return group.every(condition => {
        return match(condition)
          .with({ type: 'is_followup' }, condition => {
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
              conditions: condition.params.unit,
              targets,
              event,
              eventName
            }).some(unit => cell.entity?.equals(unit));
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

export const parseCardAction = (action: Action): ParsedActionResult => {
  return ({ session, card, entity, targets }, event, eventName) => {
    return match(action)
      .with({ type: 'deal_damage' }, action => {
        getUnits({
          session,
          entity,
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
        getUnits({
          session,
          entity,
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
        const modifierId = nanoid(6);
        const units = getUnits({
          session,
          entity,
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
              stackable: true,
              visible: false,
              mixins: [
                modifierEntityInterceptorMixin({
                  key: 'attack',
                  keywords: [],
                  interceptor: () => value =>
                    value +
                    getAmount({
                      session,
                      entity,
                      card,
                      targets,
                      amount: action.params.attack,
                      event,
                      eventName
                    })
                }),
                modifierEntityInterceptorMixin({
                  key: 'maxHp',
                  keywords: [],
                  interceptor: () => value =>
                    value +
                    getAmount({
                      session,
                      entity,
                      card,
                      targets,
                      amount: action.params.attack,
                      event,
                      eventName
                    })
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

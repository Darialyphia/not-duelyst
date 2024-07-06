import { match } from 'ts-pattern';
import type { OnPlayCtx, SerializedBlueprint } from '../card-blueprint';
import type { GameSession } from '../../game-session';
import type { Amount, PlayerCondition, UnitCondition } from '../card-effect';
import type { Entity } from '../../entity/entity';
import type { Nullable, Point3D } from '@game/shared';
import { isWithinCells } from '../../utils/targeting';
import type { Card } from '../card';
import type { Player } from '../../player/player';
import { createEntityModifier } from '../../modifier/entity-modifier';
import { modifierEntityInterceptorMixin } from '../../modifier/mixins/entity-interceptor.mixin';
import { nanoid } from 'nanoid';

type Action = SerializedBlueprint['effects'][number]['config']['actions'][number];

export const getUnits = ({
  session,
  entity,
  conditions,
  followup
}: {
  session: GameSession;
  entity?: Entity;
  conditions: UnitCondition[];
  followup: Array<Nullable<Point3D>>;
}): Entity[] =>
  session.entitySystem.getList().filter(e => {
    return conditions.every(condition => {
      return match(condition)
        .with({ type: 'has_keyword' }, () => false /*TODO*/)
        .with({ type: 'is_ally' }, () => entity?.isAlly(e.id))
        .with({ type: 'is_enemy' }, () => entity?.isEnemy(e.id))
        .with({ type: 'is_followup' }, condition => {
          const point = followup[condition.params.index];
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
            followup,
            session,
            entity
          });
          return candidates.some(candidate =>
            isWithinCells(candidate.position, e.position, 1)
          );
        })
        .exhaustive();
    });
  });

export const getPlayers = ({
  session,
  card,
  conditions
}: {
  session: GameSession;
  card: Card;
  conditions: PlayerCondition[];
}): Player[] =>
  session.playerSystem.getList().filter(p => {
    return conditions.every(condition => {
      return match(condition)
        .with({ type: 'ally_player' }, () => card.player.equals(p))
        .with({ type: 'enemy_player' }, () => card.player.opponent.equals(p))
        .with({ type: 'any_player' }, () => true)
        .exhaustive();
    });
  });

const getAmount = ({
  session,
  entity,
  card,
  amount,
  followup
}: {
  session: GameSession;
  entity?: Entity;
  card: Card;
  amount: Amount;
  followup: Array<Nullable<Point3D>>;
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
        followup,
        conditions: amount.params.unit
      });
      if (!unit) return unit;
      return unit.card.cost;
    })
    .with({ type: 'attack' }, amount => {
      const [unit] = getUnits({
        session,
        entity,
        followup,
        conditions: amount.params.unit
      });
      if (!unit) return unit;
      return unit.attack;
    })
    .with({ type: 'lowest_attack' }, amount => {
      return Math.min(
        ...getUnits({
          session,
          entity,
          followup,
          conditions: amount.params.unit
        }).map(u => u.attack)
      );
    })
    .with({ type: 'highest_attack' }, amount => {
      return Math.max(
        ...getUnits({
          session,
          entity,
          followup,
          conditions: amount.params.unit
        }).map(u => u.attack)
      );
    })
    .with({ type: 'hp' }, amount => {
      const [unit] = getUnits({
        session,
        entity,
        followup,
        conditions: amount.params.unit
      });
      if (!unit) return unit;
      return unit.hp;
    })
    .with({ type: 'lowest_hp' }, amount => {
      return Math.min(
        ...getUnits({
          session,
          entity,
          followup,
          conditions: amount.params.unit
        }).map(u => u.hp)
      );
    })
    .with({ type: 'highest_hp' }, amount => {
      return Math.max(
        ...getUnits({
          session,
          entity,
          followup,
          conditions: amount.params.unit
        }).map(u => u.hp)
      );
    })
    .exhaustive();
};

export type ParsedActionResult = (ctx: OnPlayCtx) => () => void;

const noop = () => void 0;

export const parseCardAction = (action: Action): ParsedActionResult => {
  return ({
    session,
    card,
    entity,
    followup
  }: {
    session: GameSession;
    card: Card;
    entity?: Entity;
    followup: Array<Nullable<Point3D>>;
  }) => {
    return match(action)
      .with({ type: 'deal_damage' }, action => {
        getUnits({
          session,
          entity,
          followup,
          conditions: action.params.targets
        }).forEach(target => {
          target.takeDamage(
            getAmount({ session, entity, card, followup, amount: action.params.amount })
          );
        });

        return noop;
      })
      .with({ type: 'heal' }, action => {
        getUnits({
          session,
          entity,
          followup,
          conditions: action.params.targets
        }).forEach(target => {
          target.heal(
            getAmount({ session, entity, card, followup, amount: action.params.amount })
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
              followup,
              amount: action.params.amount
            })
          );
        });

        return noop;
      })
      .with({ type: 'change_stats' }, action => {
        const modifierId = nanoid(6);
        const targets = getUnits({
          session,
          entity,
          followup,
          conditions: action.params.targets
        });

        targets.forEach(target => {
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
                      followup,
                      amount: action.params.attack
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
                      followup,
                      amount: action.params.attack
                    })
                })
              ]
            })
          );
        });

        return () =>
          targets.forEach(target => {
            target.removeModifier(modifierId);
          });
      })
      .exhaustive();
  };
};
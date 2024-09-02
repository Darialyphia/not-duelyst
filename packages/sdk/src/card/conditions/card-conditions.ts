import { match } from 'ts-pattern';
import type { Card } from '../card';
import type { Filter, NumericOperator } from '../card-effect';
import type { UnitConditionExtras } from './unit-conditions';
import type { Nullable, Point3D, AnyObject } from '@game/shared';
import type { Entity } from '../../entity/entity';
import type { GameSession } from '../../game-session';
import { CARD_KINDS } from '../card-enums';
import { getAmount, type Amount } from '../helpers/amount';
import { getPlayers, type PlayerCondition } from './player-condition';

export type CardConditionBase =
  | { type: 'any_card' }
  | { type: 'self' }
  | { type: 'minion' }
  | { type: 'spell' }
  | { type: 'artifact' }
  | { type: 'index_in_hand'; params: { index: number } }
  | { type: 'from_player'; params: { player: Filter<PlayerCondition> } }
  | {
      type: 'cost';
      params: {
        operator: NumericOperator;
        amount: Amount<{ unit: UnitConditionExtras['type'] }>;
      };
    }
  | { type: 'has_blueprint'; params: { blueprint: string[] } };

export type CardConditionExtras =
  | { type: 'drawn_card' }
  | { type: 'replaced_card' }
  | { type: 'card_replacement' };

export type CardCondition = CardConditionBase | CardConditionExtras;

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
}) => {
  const results = session.playerSystem
    .getList()
    .map(player => player.cards)
    .flat()
    .filter(c => {
      return conditions.candidates.some(group => {
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
            .with({ type: 'from_player' }, condition => {
              const players = getPlayers({
                session,
                card,
                targets,
                conditions: condition.params.player,
                event,
                eventName
              });

              return players.some(p => p.equals(c.player));
            })
            .with({ type: 'has_blueprint' }, condition => {
              return condition.params.blueprint.includes(c.blueprintId);
            })
            .exhaustive();
        });
      });
    });

  if (conditions.random && results.length) {
    const index = session.rngSystem.nextInt(results.length - 1);
    return [results[index]];
  }

  return results;
};

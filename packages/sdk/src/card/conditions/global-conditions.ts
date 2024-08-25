import { isEmptyObject, type AnyObject } from '@game/shared';
import type { ConditionOverrides, Filter, NumericOperator } from '../card-effect';
import type { CardConditionExtras } from './card-conditions';
import { getCells, type CellCondition } from './cell-conditions';
import { getPlayers, type PlayerCondition } from './player-condition';
import {
  getUnits,
  type UnitConditionBase,
  type UnitConditionExtras
} from './unit-conditions';
import type { EffectCtx } from '../card-parser';
import { match } from 'ts-pattern';
import type { Entity } from '../../entity/entity';
import { matchNumericOperator } from '../card-action';
import { getAmount, type Amount } from '../helpers/amount';
import { getKeywordById, type KeywordId } from '../../utils/keywords';
import { PlayCardAction } from '../../action/play-card.action';
import { type TagId } from '../../utils/tribes';

export type GlobalCondition<
  T extends ConditionOverrides = {
    unit: UnitConditionExtras['type'];
    card: CardConditionExtras['type'];
  }
> =
  | { type: 'active_player'; params: { player: Filter<PlayerCondition> } }
  | { type: 'target_exists'; params: { index: number } }
  | {
      type: 'player_gold';
      params: {
        player: Filter<PlayerCondition>;
        operator: NumericOperator;
        amount: Amount<T>;
      };
    }
  // eslint-disable-next-line @typescript-eslint/ban-types
  | { type: 'played_from_hand'; params: {} }
  | {
      type: 'player_hp';
      params: {
        player: Filter<PlayerCondition>;
        operator: NumericOperator;
        amount: Amount<T>;
      };
    }
  | {
      type: 'unit_state';
      params: {
        unit: Filter<UnitConditionBase>;
        mode: 'none' | 'some' | 'all';
        attack?: {
          operator: NumericOperator;
          amount: Amount<T>;
        };
        hp?: {
          operator: NumericOperator;
          amount: Amount<T>;
        };
        keyword?: KeywordId;
        tag?: TagId;
        position?: Filter<CellCondition>;
      };
    }
  | {
      type: 'player_has_more_minions';
      params: {
        player: Filter<PlayerCondition>;
      };
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
  if (!conditions.candidates.length) return true;

  return conditions.candidates.some(group => {
    return group.every(condition => {
      return match(condition)
        .with({ type: 'active_player' }, condition => {
          const [player] = getPlayers({
            session,
            card,
            event,
            eventName,
            targets,
            conditions: condition.params.player
          });

          return player.isActive;
        })
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
            const { attack, hp, position, keyword, tag } = condition.params;
            const ctx = { session, card, entity, targets, event, eventName };
            const attackMatch =
              // we need this check because GUI generated all optional parameters with empty values
              attack && !isEmptyObject(attack.amount)
                ? matchNumericOperator(
                    getAmount({
                      ...ctx,
                      amount: attack.amount
                    }),
                    e.attack,
                    attack.operator
                  )
                : true;

            const hpMatch =
              hp && !isEmptyObject(hp?.amount)
                ? matchNumericOperator(
                    getAmount({
                      ...ctx,
                      amount: hp.amount
                    }),
                    e.hp,
                    hp.operator
                  )
                : true;

            const positionMatch =
              position && !isEmptyObject(position.candidates[0][0])
                ? getCells({ ...ctx, conditions: position }).some(cell => {
                    return cell.position.equals(e.position);
                  })
                : true;

            const keywordMatch = keyword ? e.hasKeyword(getKeywordById(keyword)!) : true;
            const tagMatch = tag ? e.hasTag(tag) : true;

            return attackMatch && hpMatch && positionMatch && keywordMatch && tagMatch;
          };

          return match(condition.params.mode)
            .with('all', () => entities.every(isMatch))
            .with('none', () => entities.every(e => !isMatch(e)))
            .with('some', () => entities.some(isMatch))
            .exhaustive();
        })
        .with({ type: 'played_from_hand' }, () => {
          const currentAction = session.actionSystem.currentAction;
          if (!currentAction) return false;
          const isCardBeingPlayed = currentAction instanceof PlayCardAction;

          if (!isCardBeingPlayed) return false;
          return card.equals(currentAction.cachedCard);
        })
        .with({ type: 'target_exists' }, condition => {
          return !!targets[condition.params.index];
        })
        .with({ type: 'player_has_more_minions' }, condition => {
          const [player] = getPlayers({
            session,
            card,
            event,
            eventName,
            targets,
            conditions: condition.params.player
          });

          return player.entities.length > player.opponent.entities.length;
        })
        .exhaustive();
    });
  });
};

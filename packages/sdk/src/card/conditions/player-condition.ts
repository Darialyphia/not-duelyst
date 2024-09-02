import { match } from 'ts-pattern';
import type { GameSession } from '../../game-session';
import type { Player } from '../../player/player';
import type { Card } from '../card';
import type { Filter } from '../card-effect';
import type { AnyObject, Nullable, Point3D } from '@game/shared';

export type PlayerConditionBase =
  | { type: 'ally_player' }
  | { type: 'enemy_player' }
  | { type: 'any_player' }
  | { type: 'is_manual_target_owner'; params: { index: number } };

export type PlayerConditionExtras =
  | { type: 'attack_target_owner' }
  | { type: 'attack_source_owner' }
  | { type: 'healing_target_owner' }
  | { type: 'healing_source_owner' }
  | { type: 'moved_unit_owner' }
  | { type: 'played_unit_owner' }
  | { type: 'destroyed_unit_owner' };

export type PlayerCondition = PlayerConditionBase | PlayerConditionExtras;

export const getPlayers = ({
  session,
  card,
  targets,
  conditions,
  event,
  eventName
}: {
  session: GameSession;
  card: Card;
  targets: Array<Nullable<Point3D>>;
  conditions: Filter<PlayerCondition>;
  event: AnyObject;
  eventName?: string;
}): Player[] => {
  const results = session.playerSystem.getList().filter(p => {
    return conditions.candidates.some(group => {
      return group.every(condition => {
        return match(condition)
          .with({ type: 'ally_player' }, () => card.player.equals(p))
          .with({ type: 'enemy_player' }, () => card.player.opponent.equals(p))
          .with({ type: 'any_player' }, () => true)
          .with({ type: 'is_manual_target_owner' }, condition => {
            const point = targets[condition.params.index];
            if (!point) return false;
            const entity = session.entitySystem.getEntityAt(point);
            if (!entity) return false;
            return p.equals(entity.player);
          })
          .with({ type: 'attack_source_owner' }, () => {
            if (
              eventName === 'entity:before_attack' ||
              eventName === 'entity:after_attack' ||
              eventName === 'entity:before_retaliate' ||
              eventName === 'entity:after_retaliate' ||
              eventName === 'entity:before_deal_damage' ||
              eventName === 'entity:after_deal_damage'
            ) {
              return event.entity && p.equals(event.entity.player);
            }

            if (
              eventName === 'entity:before_take_damage' ||
              eventName === 'entity:after_take_damage'
            ) {
              return event.source && p.equals(event.source.player);
            }

            return false;
          })
          .with({ type: 'attack_target_owner' }, () => {
            if (
              eventName === 'entity:before_attack' ||
              eventName === 'entity:after_attack' ||
              eventName === 'entity:before_retaliate' ||
              eventName === 'entity:after_retaliate' ||
              eventName === 'entity:before_deal_damage' ||
              eventName === 'entity:after_deal_damage'
            ) {
              return event.target && p.equals(event.target.player);
            }

            if (
              eventName === 'entity:before_take_damage' ||
              eventName === 'entity:after_take_damage'
            ) {
              return event.entity && p.equals(event.entity.player);
            }

            return false;
          })
          .with({ type: 'healing_source_owner' }, () => {
            return event.source && p.equals(event.source.player);
          })
          .with({ type: 'healing_target_owner' }, () => {
            return event.entity && p.equals(event.entity.player);
          })
          .with({ type: 'moved_unit_owner' }, () => {
            return p.equals(event.entity.player);
          })
          .with({ type: 'destroyed_unit_owner' }, () => {
            return p.equals(event.player);
          })
          .with({ type: 'played_unit_owner' }, () => {
            return p.equals(event.player);
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

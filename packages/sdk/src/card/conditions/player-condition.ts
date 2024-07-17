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
  | { type: 'attack_target' }
  | { type: 'attack_source' }
  | { type: 'healing_target' }
  | { type: 'healing_source' }
  | { type: 'moved_unit' }
  | { type: 'played_unit' }
  | { type: 'destroyed_unit' };

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
}): Player[] =>
  session.playerSystem.getList().filter(p => {
    return conditions.some(group => {
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
          .with({ type: 'attack_source' }, () => {
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
          .with({ type: 'attack_target' }, () => {
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
          .with({ type: 'healing_source' }, () => {
            return event.source && p.equals(event.source.player);
          })
          .with({ type: 'healing_target' }, () => {
            return event.entity && p.equals(event.entity.player);
          })
          .with({ type: 'moved_unit' }, () => {
            return p.equals(event.entity.player);
          })
          .with({ type: 'destroyed_unit' }, () => {
            return p.equals(event.player);
          })
          .with({ type: 'played_unit' }, () => {
            return p.equals(event.player);
          })
          .exhaustive();
      });
    });
  });

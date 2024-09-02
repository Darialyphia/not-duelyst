import { match } from 'ts-pattern';
import type { GameSession } from '../../game-session';
import type { Card } from '../card';
import type { Filter } from '../card-effect';
import type { AnyObject, Nullable, Point3D } from '@game/shared';
import { getAmount, type Amount } from '../helpers/amount';
import type { CardConditionExtras } from './card-conditions';
import type { UnitConditionExtras } from './unit-conditions';
import type { PlayerArtifact } from '../../player/player-artifact';
import type { Entity } from '../../entity/entity';

export type ArtifactCondition =
  | { type: 'equiped_by_ally' }
  | { type: 'equiped_by_enemy' }
  | { type: 'position'; params: { index: number } }
  | { type: 'last_equiped' }
  | {
      type: 'has_durability';
      params: {
        amount: Amount<{
          unit: UnitConditionExtras['type'];
          card: CardConditionExtras['type'];
        }>;
      };
    };

export const getEquipedArtifact = ({
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
  conditions: Filter<ArtifactCondition>;
  targets: Array<Nullable<Point3D>>;
  event: AnyObject;
  eventName?: string;
  playedPoint?: Point3D;
}): PlayerArtifact[] => {
  const results = session.playerSystem
    .getList()
    .map(p => {
      return p.artifacts.filter((artifact, index) => {
        return conditions.candidates.some(group => {
          return group.every(condition => {
            return match(condition)
              .with({ type: 'equiped_by_ally' }, () => {
                return artifact.player.equals(card.player);
              })
              .with({ type: 'equiped_by_enemy' }, () => {
                return !artifact.player.equals(card.player);
              })
              .with({ type: 'position' }, condition => {
                return index === condition.params.index;
              })
              .with({ type: 'last_equiped' }, () => {
                return index === p.artifacts.length - 1;
              })
              .with({ type: 'has_durability' }, condition => {
                const amount = getAmount({
                  targets,
                  session,
                  entity,
                  card,
                  event,
                  eventName,
                  amount: condition.params.amount
                });

                return artifact.durability === amount;
              })
              .exhaustive();
          });
        });
      });
    })
    .flat();

  if (conditions.random && results.length) {
    const index = session.rngSystem.nextInt(results.length - 1);
    return [results[index]];
  }

  return results;
};

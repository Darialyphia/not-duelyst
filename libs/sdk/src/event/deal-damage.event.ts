import { EntityId } from '../entity/entity';
import { EVENT_NAME, GameEvent } from './event';

export type DealDamageEventPayload = {
  amount: number;
  sourceId: EntityId;
  targets: EntityId[];
};

export class DealDamageEvent extends GameEvent<DealDamageEventPayload> {
  protected name = EVENT_NAME.DEAL_DAMAGE;

  impl() {}
}

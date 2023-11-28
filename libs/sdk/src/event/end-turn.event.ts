import { EntityId } from '../entity/entity';
import { GameContext } from '../game';
import { Point3D } from '../types';
import { EVENT_NAME, GameEvent } from './event';

export type EndTurnEventPayload = Record<string, never>;

export class EndTurnEvent extends GameEvent<EndTurnEventPayload> {
  protected name = EVENT_NAME.MOVE;

  impl(ctx: GameContext) {
    ctx.atb.activeEntity.endTurn();
  }
}

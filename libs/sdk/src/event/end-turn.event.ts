import { EVENT_NAME, GameEvent } from './event';

export type EndTurnEventPayload = Record<string, never>;

export class EndTurnEvent extends GameEvent<EndTurnEventPayload> {
  protected name = EVENT_NAME.MOVE;

  impl() {
    this.ctx.atb.activeEntity.endTurn();
  }
}

import { EVENT_NAME, GameEvent } from './event';

export type EndTurnEventPayload = Record<string, never>;

export class EndTurnEvent extends GameEvent<EndTurnEventPayload> {
  readonly name = EVENT_NAME.MOVE;

  protected impl() {
    this.ctx.atb.activeEntity.endTurn();
  }
}

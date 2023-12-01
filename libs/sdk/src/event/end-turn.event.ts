import { GameEvent } from './event';

export type EndTurnEventPayload = Record<string, never>;

export class EndTurnEvent extends GameEvent<EndTurnEventPayload> {
  readonly name = 'END_TURN';

  protected impl() {
    this.ctx.atb.activeEntity.endTurn();
  }
}

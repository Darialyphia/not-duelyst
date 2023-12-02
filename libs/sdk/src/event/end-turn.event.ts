import { PlayerId } from '../player/player';
import { GameEvent } from './event';

export type EndTurnEventPayload = { playerId: PlayerId };

export class EndTurnEvent extends GameEvent<EndTurnEventPayload> {
  readonly name = 'END_TURN';

  protected impl() {
    this.ctx.atb.activeEntity.endTurn();
  }
}

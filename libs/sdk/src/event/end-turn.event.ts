import { PlayerId } from '../player/player';
import { GameEvent } from './event';

export type EndTurnEventPayload = { playedId: PlayerId };

export class EndTurnEvent extends GameEvent<'END_TURN', EndTurnEventPayload> {
  readonly name = 'END_TURN';

  protected impl() {
    this.ctx.atb.activeEntity.endTurn();
  }
}

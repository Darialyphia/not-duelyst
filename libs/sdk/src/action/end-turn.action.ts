import { PlayerId } from '../player/player';
import { GameAction } from './action';

export class EndTurnAction extends GameAction<{ playerId: PlayerId }> {
  readonly name = 'END_TURN';

  get logMessage() {
    return `${this.payload.playerId} ends their turn.`;
  }

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    this.ctx.playerManager.switchActivePlayer();
  }
}

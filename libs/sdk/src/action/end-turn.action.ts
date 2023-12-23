import { PlayerId } from '../player/player';
import { GameAction } from './action';

export class EndTurnAction extends GameAction<{ playerId: PlayerId }> {
  readonly name = 'END_TURN';

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    this.ctx.playerManager.switchActivePlayer();
  }
}

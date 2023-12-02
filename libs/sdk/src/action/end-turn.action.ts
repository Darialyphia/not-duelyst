import { PlayerId } from '../player/player';
import { GameAction } from './action';

export class EndTurnAction extends GameAction<{ playerId: PlayerId }> {
  readonly name = 'END_TURN';

  protected impl() {
    this.ctx.atb.activeEntity.endTurn();
  }
}

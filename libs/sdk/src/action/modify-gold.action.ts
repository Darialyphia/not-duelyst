import { PlayerId } from '../player/player';
import { GameAction } from './action';

export class ModifyGoldAction extends GameAction<{ playerId: PlayerId; amount: number }> {
  readonly name = 'MODIFY_GOLD';

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    this.ctx.playerManager.getPlayerById(this.payload.playerId)!.gold +=
      this.payload.amount;
  }
}

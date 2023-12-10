import { EntityId } from '../entity/entity';
import { PlayerId } from '../player/player';
import { GameAction } from './action';
import { EndTurnAction } from './end-turn.action';

export class EndGamection extends GameAction<{ winnerId: PlayerId }> {
  readonly name = 'END_GAME';

  protected async fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    this.ctx.winner = this.payload.winnerId;
  }
}

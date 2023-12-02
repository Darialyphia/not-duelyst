import { GameAction, defaultActionSchema } from './action';
import { ensureActiveEntityBelongsToPlayer } from '../entity/entity-utils';
import { ACTION_NAME } from './action-reducer';
import { EndTurnEvent } from '../event/end-turn.event';

const endTurnEventSchema = defaultActionSchema;

export class EndTurnAction extends GameAction<typeof endTurnEventSchema> {
  readonly name = ACTION_NAME.END_TURN;

  protected payloadSchema = endTurnEventSchema;

  impl() {
    if (ensureActiveEntityBelongsToPlayer(this.ctx, this.payload.playerId)) {
      this.ctx.history.add(
        new EndTurnEvent({ playerId: this.payload.playerId }, this.ctx).execute()
      );
    }
  }
}

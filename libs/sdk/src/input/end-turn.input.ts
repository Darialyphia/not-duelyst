import { PlayerInput, defaultInputSchema } from './input';
import { ensureActiveEntityBelongsToPlayer } from '../entity/entity-utils';
import { INPUT_NAME } from './input-reducer';
import { EndTurnEvent } from '../action/end-turn.action';

const endTurnEventSchema = defaultInputSchema;

export class EndTurnAction extends PlayerInput<typeof endTurnEventSchema> {
  readonly name = INPUT_NAME.END_TURN;

  protected payloadSchema = endTurnEventSchema;

  impl() {
    if (ensureActiveEntityBelongsToPlayer(this.ctx, this.payload.playerId)) {
      this.ctx.history.add(
        new EndTurnEvent({ playerId: this.payload.playerId }, this.ctx).execute()
      );
    }
  }
}

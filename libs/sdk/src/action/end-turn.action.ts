import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GameContext } from '../game';
import { ensureActiveEntityBelongsToPlayer } from '../entity/entity-utils';
import { ACTION_NAME } from './action-reducer';
import { EndTurnEvent } from '../event/end-turn.event';

const endTurnEventSchema = defaultActionSchema;

export class EndTurnAction extends GameAction<typeof endTurnEventSchema> {
  protected name = ACTION_NAME.END_TURN;

  protected payloadSchema = endTurnEventSchema;

  impl() {
    if (ensureActiveEntityBelongsToPlayer(this.ctx, this.payload.playerId)) {
      this.ctx.history.add(new EndTurnEvent({}, this.ctx).execute());
    }
  }
}

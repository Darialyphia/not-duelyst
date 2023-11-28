import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GameContext } from '../game';
import { ensureActiveEntityBelongsToPlayer } from '../entity/entity-utils';
import { ACTION_NAME } from './action-reducer';
import { EndTurnEvent } from '../event/end-turn.event';

const endTurnEventSchema = defaultActionSchema;

type EndTurnActionPayload = z.infer<typeof endTurnEventSchema>;

export class EndTurnAction extends GameAction<typeof endTurnEventSchema> {
  protected name = ACTION_NAME.END_TURN;

  protected payloadSchema = endTurnEventSchema;

  impl(payload: EndTurnActionPayload, ctx: GameContext) {
    if (ensureActiveEntityBelongsToPlayer(ctx, payload.playerId)) {
      new EndTurnEvent({}).execute(ctx);
    }
  }
}

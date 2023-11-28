import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GameContext } from '../game';
import { Pathfinder } from '../pathfinding';
import {
  ensureActiveEntityBelongsToPlayer,
  ensureEntityBelongsToPlayer,
  getEntityIfOwnerMatches
} from '../entity/entity-utils';
import { Vec3 } from '../utils/vector';
import { ACTION_NAME, ActionName, RawAction } from './action-reducer';
import { MoveEvent } from '../event/move.event';
import { cellIdToPoint } from '../utils/helpers';

const endTurnEventSchema = defaultActionSchema;

type MoveActionPayload = z.infer<typeof endTurnEventSchema>;

export class EndTurnAction extends GameAction<typeof endTurnEventSchema> {
  protected name = ACTION_NAME.END_TURN;

  protected payloadSchema = endTurnEventSchema;

  impl(payload: MoveActionPayload, ctx: GameContext) {
    if (ensureActiveEntityBelongsToPlayer(ctx, payload.playerId)) {
      ctx.atb.activeEntity.endTurn();
    }
  }
}

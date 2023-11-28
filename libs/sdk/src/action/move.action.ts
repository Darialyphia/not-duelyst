import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GameContext } from '../game';
import { Pathfinder } from '../pathfinding';
import { getEntityIfOwnerMatches } from '../entity/entity-utils';
import { Vec3 } from '../utils/vector';
import { ACTION_NAME, ActionName, RawAction } from './action-reducer';
import { MoveEvent } from '../event/move.event';
import { cellIdToPoint } from '../utils/helpers';

const moveEventSchema = defaultActionSchema.extend({
  entityId: z.number(),
  x: z.number(),
  y: z.number(),
  z: z.number()
});

type MoveActionPayload = z.infer<typeof moveEventSchema>;

export class MoveAction extends GameAction<typeof moveEventSchema> {
  protected name = ACTION_NAME.MOVE;

  protected payloadSchema = moveEventSchema;

  impl(payload: MoveActionPayload, ctx: GameContext) {
    const entity = getEntityIfOwnerMatches(
      ctx,
      payload.entityId,
      payload.playerId
    );
    if (!entity) return;

    if (!entity.equals(ctx.atb.activeEntity)) return;

    const path = new Pathfinder(ctx).findPath(entity.position, payload);
    if (!path) return;

    if (entity.canMove(path.distance)) {
      new MoveEvent({
        entityId: payload.entityId,
        path: path.path.map(cellIdToPoint)
      }).execute(ctx);
    }
  }
}

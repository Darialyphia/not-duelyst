import { z } from 'zod';
import { PlayerInput, defaultInputSchema } from './input';
import { Pathfinder } from '../map/pathfinding';
import { getEntityIfOwnerMatches } from '../entity/entity-utils';
import { INPUT_NAME } from './input-reducer';
import { cellIdToPoint } from '../utils/helpers';
import { MoveAction } from '../action/move.action';

const moveEventSchema = defaultInputSchema.extend({
  entityId: z.number(),
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export class MoveInput extends PlayerInput<typeof moveEventSchema> {
  readonly name = INPUT_NAME.MOVE;

  protected payloadSchema = moveEventSchema;

  impl() {
    const entity = getEntityIfOwnerMatches(
      this.ctx,
      this.payload.entityId,
      this.payload.playerId
    );
    if (!entity) return;

    if (!entity.equals(this.ctx.atb.activeEntity)) return;

    const path = new Pathfinder(this.ctx).findPath(entity.position, this.payload);
    if (!path) return;

    if (entity.canMove(path.distance)) {
      this.ctx.history.add(
        new MoveAction(
          {
            entityId: this.payload.entityId,
            path: path.path.map(cellIdToPoint)
          },
          this.ctx
        ).execute()
      );
    }
  }
}

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

    const path = this.ctx.map.getPathTo(entity, this.payload);
    if (!path) return;

    if (!entity.canMove(path.distance)) return null;

    new MoveAction(
      {
        entityId: this.payload.entityId,
        path: path.path.map(vec => vec.serialize())
      },
      this.ctx
    ).execute();
  }
}

import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { Entity } from '../entity/entity';
import { GameContext } from '../game';
import { Pathfinder } from '../pathfinding';
import { ensureEntityBelongsTo } from '../entity/entity-utils';
import { Vec3 } from '../utils/vector';

const moveEventSchema = defaultActionSchema.extend({
  entityId: z.number(),
  x: z.number(),
  y: z.number(),
  z: z.number()
});

type MoveActionPayload = z.infer<typeof moveEventSchema>;

export class MoveAction extends GameAction<typeof moveEventSchema> {
  protected payloadSchema = moveEventSchema;

  impl(payload: MoveActionPayload, ctx: GameContext) {
    const entity = ensureEntityBelongsTo(
      ctx,
      payload.entityId,
      payload.playerId
    );
    if (!entity) return;

    const path = new Pathfinder(ctx).findPath(entity.position, payload);
    if (!path) return;

    entity.position = Vec3.fromPoint3D(payload);
  }
}

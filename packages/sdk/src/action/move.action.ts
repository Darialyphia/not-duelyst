import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema.extend({
  entityId: z.number(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  })
});

export class MoveAction extends GameAction<typeof schema> {
  readonly name = 'move';

  protected payloadSchema = schema;

  get entity() {
    const entity = this.session.entitySystem.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);
    return entity;
  }

  get path() {
    const path = this.session.boardSystem.getPathTo(this.entity, this.payload.position);

    if (!path) throw new Error(`No path found for destination ${this.payload.position}.`);

    return path;
  }

  async impl() {
    if (!this.entity.canMove(this.path.distance)) {
      throw new Error(`Entity ${this.entity.id} cannot move to target cell.`);
    }
    await this.entity.move(this.path.path);
  }
}

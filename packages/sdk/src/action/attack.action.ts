import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema.extend({
  entityId: z.number(),
  targetId: z.number()
});

export class AttackAction extends GameAction<typeof schema> {
  readonly name = 'attack';

  protected payloadSchema = schema;

  get entity() {
    const entity = this.session.entitySystem.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);
    return entity;
  }

  get target() {
    const entity = this.session.entitySystem.getEntityById(this.payload.targetId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.targetId}`);
    return entity;
  }

  async impl() {
    await this.entity.performAttack(this.target);
  }
}

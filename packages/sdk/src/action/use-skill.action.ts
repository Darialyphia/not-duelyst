import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { isDefined } from '@game/shared';
import { config } from '../config';

const schema = defaultActionSchema.extend({
  entityId: z.number(),
  skillIndex: z.number().nonnegative(),
  targets: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    })
    .array(),
  blueprintFollowup: z.number().array()
});

export class UseSkillAction extends GameAction<typeof schema> {
  readonly name = 'useSkill';

  protected payloadSchema = schema;

  get entity() {
    return this.session.entitySystem.getEntityById(this.payload.entityId);
  }

  async impl() {
    if (!this.entity) {
      return this.printError(`Entity not found: ${this.payload.entityId}`);
    }

    if (!this.entity.canUseSkill(this.entity.skills[this.payload.skillIndex])) {
      return this.printError(
        `Entity ${this.entity.id}(${this.entity.card.blueprintId}) cannot use skill at index ${this.payload.skillIndex}`
      );
    }

    return this.entity.useSkill(
      this.payload.skillIndex,
      this.payload.targets,
      this.payload.blueprintFollowup
    );
  }
}

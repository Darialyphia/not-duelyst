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

  async impl() {
    const entity = this.session.entitySystem.getEntityById(this.payload.entityId);
    if (!entity) return;

    return entity.useSkill(
      this.payload.skillIndex,
      this.payload.targets,
      this.payload.blueprintFollowup
    );
  }
}

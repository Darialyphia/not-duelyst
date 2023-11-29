import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GameContext } from '../game';
import { ACTION_NAME } from './action-reducer';
import { ensureActiveEntityBelongsToPlayer, isGeneral } from '../entity/entity-utils';
import { SummonEvent } from '../event/summon.event';

const useSkillEventSchema = defaultActionSchema.extend({
  playerId: z.string(),
  skillId: z.string(),
  target: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  })
});

export class UseSkillAction extends GameAction<typeof useSkillEventSchema> {
  protected name = ACTION_NAME.USE_SKILL;

  protected payloadSchema = useSkillEventSchema;

  private getSkill(ctx: GameContext) {
    return ctx.atb.activeEntity.skills.find(skill => skill.id === this.payload.skillId);
  }

  private canUseSkill(ctx: GameContext) {
    const skill = this.getSkill(ctx);
    if (!skill) return false;

    return (
      ctx.atb.activeEntity.canUseSkill(skill) &&
      skill.isTargetable(ctx, this.payload.target, ctx.atb.activeEntity)
    );
  }

  impl(ctx: GameContext) {
    if (this.canUseSkill(ctx)) {
    }
  }
}

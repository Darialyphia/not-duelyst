import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GameContext } from '../game';
import { ACTION_NAME } from './action-reducer';
import { UseSkillEvent } from '../event/use-sklll.event';

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
  readonly name = ACTION_NAME.USE_SKILL;

  protected payloadSchema = useSkillEventSchema;

  private getSkill(ctx: GameContext) {
    return ctx.atb.activeEntity.skills.find(skill => skill.id === this.payload.skillId);
  }

  private get canUseSkill() {
    const skill = this.getSkill(this.ctx);
    if (!skill) return false;

    return (
      this.ctx.atb.activeEntity.canUseSkill(skill) &&
      skill.isTargetable(this.ctx, this.payload.target, this.ctx.atb.activeEntity)
    );
  }

  impl() {
    if (!this.canUseSkill) return;

    this.ctx.history.add(
      new UseSkillEvent(
        {
          casterId: this.ctx.atb.activeEntity.id,
          target: this.payload.target,
          skillId: this.payload.skillId
        },
        this.ctx
      )
    );
  }
}

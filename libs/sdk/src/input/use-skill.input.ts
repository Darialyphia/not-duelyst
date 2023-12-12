import { z } from 'zod';
import { PlayerInput, defaultInputSchema } from './input';
import { INPUT_NAME } from './input-reducer';
import { UseSkillAction } from '../action/use-sklll.action';

const useSkillEventSchema = defaultInputSchema.extend({
  playerId: z.string(),
  skillId: z.string(),
  target: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  })
});

export class UseSkillInput extends PlayerInput<typeof useSkillEventSchema> {
  readonly name = INPUT_NAME.USE_SKILL;

  protected payloadSchema = useSkillEventSchema;

  private getSkill() {
    return this.ctx.atb.activeEntity.skills.find(
      skill => skill.id === this.payload.skillId
    );
  }

  private get canUseSkill() {
    const skill = this.getSkill();
    if (!skill) return false;

    return (
      this.ctx.atb.activeEntity.canUseSkillAt(skill, this.payload.target) &&
      skill.isTargetable(this.ctx, this.payload.target, this.ctx.atb.activeEntity)
    );
  }

  impl() {
    const skill = this.getSkill();
    if (!skill) return;

    if (!this.canUseSkill) return;

    this.ctx.actionQueue.push(
      new UseSkillAction(
        {
          casterId: this.ctx.atb.activeEntity.id,
          skillId: this.payload.skillId,
          target: this.payload.target
        },
        this.ctx
      )
    );
  }
}

import { z } from 'zod';
import { PlayerInput, defaultInputSchema } from './input';
import { INPUT_NAME } from './input-reducer';
import { UseSkillAction } from '../action/use-sklll.action';

const useSkillEventSchema = defaultInputSchema.extend({
  playerId: z.string(),
  skillId: z.string(),
  targets: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    })
    .array()
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
      this.ctx.atb.activeEntity.canUseSkillAt(skill, this.payload.targets) &&
      this.payload.targets.length >= skill.minTargets &&
      this.payload.targets.length <= skill.maxTargets &&
      this.payload.targets.every(target =>
        skill.isTargetable(
          this.ctx,
          target,
          this.ctx.atb.activeEntity,
          this.payload.targets
        )
      )
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
          targets: this.payload.targets
        },
        this.ctx
      )
    );
  }
}

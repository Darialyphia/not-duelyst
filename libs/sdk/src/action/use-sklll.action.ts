import { EntityId } from '../entity/entity';
import { SkillId } from '../skill/skill-builder';
import { Point3D } from '../types';
import { FXContext, GameAction } from './action';

export class UseSkillAction extends GameAction<{
  casterId: EntityId;
  skillId: SkillId;
  target: Point3D;
}> {
  readonly name = 'USE_SKILL';

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;

    await this.ctx.fxContext.playAnimationOnce(this.payload.casterId, 'use_skill');
  }

  protected impl() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.casterId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.casterId}`);

    entity.useSkill(this.payload.skillId);

    const skill = this.ctx.atb.activeEntity.skills.find(
      skill => skill.id === this.payload.skillId
    );
    if (!skill) throw new Error(`Skill not found : ${this.payload.skillId}`);

    const affectedCells = this.ctx.map.cells.filter(cell =>
      skill.isInAreaOfEffect(
        this.ctx,
        cell,
        this.ctx.atb.activeEntity,
        this.payload.target
      )
    );

    skill.execute(
      this.ctx,
      this.ctx.atb.activeEntity,
      this.payload.target,
      affectedCells
    );
  }
}

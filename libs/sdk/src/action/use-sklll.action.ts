import { EntityId } from '../entity/entity';
import { SkillId } from '../skill/skill';
import { Point3D } from '../types';
import { FXContext, GameAction } from './action';

export class UseSkillAction extends GameAction<{
  casterId: EntityId;
  skillId: SkillId;
  target: Point3D;
}> {
  readonly name = 'USE_SKILL';

  private get skill() {
    const skill = this.ctx.atb.activeEntity.skills.find(
      skill => skill.id === this.payload.skillId
    );
    if (!skill) throw new Error(`Skill not found: ${this.payload.skillId}`);
    return skill;
  }

  private get affectedCells() {
    return this.ctx.map.cells.filter(cell =>
      this.skill.isInAreaOfEffect(
        this.ctx,
        cell,
        this.ctx.atb.activeEntity,
        this.payload.target
      )
    );
  }

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;

    await Promise.all([
      this.skill.fxImpl(
        this.ctx,
        this.ctx.atb.activeEntity,
        this.payload.target,
        this.affectedCells
      ),
      this.ctx.fxContext.playSoundOnce(this.skill.soundFX, {
        fallback: 'attack-placeholder',
        percentage: 0.5
      }),

      this.ctx.fxContext.playAnimationOnce(
        this.payload.casterId,
        this.skill.animationFX,
        {
          animationNameFallback: 'attack'
        }
      )
    ]);
  }

  protected impl() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.casterId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.casterId}`);

    entity.useSkill(this.payload.skillId);

    this.skill.execute(
      this.ctx,
      this.ctx.atb.activeEntity,
      this.payload.target,
      this.affectedCells
    );
  }
}

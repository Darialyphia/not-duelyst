import { EFFECTS } from '../effect/effect-lookup';
import { EntityId } from '../entity/entity';
import { SkillId } from '../skill/skill';
import { Point3D } from '../types';
import { GameAction } from './action';

export class UseSkillAction extends GameAction<{
  casterId: EntityId;
  skillId: SkillId;
  targets: Point3D[];
}> {
  readonly name = 'USE_SKILL';

  private get caster() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.casterId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.casterId}`);

    return entity;
  }

  private get skill() {
    const skill = this.caster.skills.find(skill => skill.id === this.payload.skillId);
    if (!skill) throw new Error(`Skill not found: ${this.payload.skillId}`);
    return skill;
  }

  private get affectedCells() {
    return this.ctx.map.cells.filter(cell =>
      this.skill.isInAreaOfEffect(this.ctx, cell, this.caster, this.payload.targets)
    );
  }

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;

    this.ctx.fxContext.playSoundOnce(this.skill.soundFX, {
      fallback: 'attack-placeholder'
    });

    await Promise.all([
      this.skill.fxImpl(this.ctx, this.caster, this.payload.targets, this.affectedCells),

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

    this.skill.execute(this.ctx, this.caster, this.payload.targets, this.affectedCells);

    new EFFECTS.exhausted(this.ctx, entity, {}).attach(entity);
  }
}

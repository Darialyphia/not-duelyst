import { EntityId } from '../entity/entity';
import { SkillId } from '../skill/skill-builder';
import { GameAction } from './action';

export class UseSkillAction extends GameAction<{
  casterId: EntityId;
  skillId: SkillId;
}> {
  readonly name = 'USE_SKILL';

  protected impl() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.casterId);
    entity?.useSkill(this.payload.skillId);
  }
}

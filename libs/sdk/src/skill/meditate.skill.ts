import { PartialBy } from '@hc/shared';
import { Entity } from '../entity/entity';
import { isAlly } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillOptions } from './skill';
import { isSelf, isWithinCells } from './skill-utils';
import { AddEffectAction } from '../action/add-effect';

export type HealOptions = PartialBy<SkillOptions, 'spriteId'>;

export class Meditate extends Skill {
  readonly id = 'meditate';

  constructor(options: HealOptions) {
    super({ ...options, spriteId: options.spriteId ?? 'meditate' });
  }

  getDescription() {
    return `Regain all your AP. You cannot move or use another skill the same turn you cast this skill.`;
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return isSelf(caster, ctx.entityManager.getEntityAt(point));
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      this.isWithinRange(ctx, point, caster) &&
      caster.remainingMovement === caster.speed &&
      !caster.hasUsedSkillThisTurn
    );
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, targets: Point3D[]) {
    return (
      isAlly(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId) &&
      isWithinCells(ctx, targets[0], point, 0)
    );
  }

  execute(ctx: GameSession, caster: Entity) {
    caster.ap = caster.maxAp;
    ctx.actionQueue.push(
      new AddEffectAction(
        {
          effectId: 'meditating',
          effectArg: {},
          attachedTo: caster.id,
          sourceId: caster.id
        },
        ctx
      )
    );
  }
}

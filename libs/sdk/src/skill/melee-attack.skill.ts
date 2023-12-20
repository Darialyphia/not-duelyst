import { PartialBy } from '@hc/shared';
import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillOptions } from './skill';
import { isWithinCells, isAxisAligned, isSelf } from './skill-utils';

export type MeleeAttackOptions = PartialBy<SkillOptions, 'spriteId'> & { power: number };

export class MeleeAttack extends Skill {
  readonly id = 'melee_attack';

  public readonly power: number;

  constructor(options: MeleeAttackOptions) {
    super({
      animationFX: 'attack',
      soundFX: 'attack-placeholder',
      spriteId: options.spriteId ?? 'melee_attack',
      ...options
    });
    this.power = options.power;
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId) &&
      isWithinCells(ctx, caster.position, point, { x: 1, y: 1, z: 0.5 }) &&
      isAxisAligned(point, caster.position)
    );
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, target: Point3D) {
    return isSelf(
      ctx.entityManager.getEntityAt(target)!,
      ctx.entityManager.getEntityAt(point)
    );
  }

  execute(ctx: GameSession, caster: Entity, target: Point3D) {
    const entity = ctx.entityManager.getEntityAt(target)!;
    ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.power,
          sourceId: caster.id,
          targets: [entity.id]
        },
        ctx
      )
    );
  }
}

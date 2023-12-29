import { PartialBy } from '@hc/shared';
import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillDescriptionContext, SkillOptions } from './skill';
import { isWithinCells, isSelf } from './skill-utils';

export type MeleeAttackOptions = PartialBy<
  SkillOptions,
  'spriteId' | 'name' | 'shouldExhaustCaster'
> & {
  power: number;
};

export class MeleeAttack extends Skill {
  readonly id = 'melee_attack';

  public readonly power: number;

  constructor(options: MeleeAttackOptions) {
    super({
      animationFX: 'attack',
      soundFX: 'attack-placeholder',
      spriteId: options.spriteId ?? 'melee_attack',
      name: options.name ?? 'Melee attack',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
    this.power = options.power;
  }

  getDescription(caster: SkillDescriptionContext) {
    return `Deals ${caster.attack + this.power} damage to a nearby enemy.`;
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return isWithinCells(ctx, caster.position, point, { x: 1, y: 1, z: 0.5 });
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      this.isWithinRange(ctx, point, caster) &&
      isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId)
    );
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, targets: Point3D[]) {
    return isSelf(
      ctx.entityManager.getEntityAt(targets[0])!,
      ctx.entityManager.getEntityAt(point)
    );
  }

  execute(ctx: GameSession, caster: Entity, [target]: Point3D[]) {
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

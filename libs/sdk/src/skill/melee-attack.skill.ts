import { PartialBy } from '@hc/shared';
import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillDescriptionContext, SkillOptions } from './skill';
import { isWithinCells, isSelf } from './skill-utils';
import { Cell } from '../map/cell';

export type MeleeAttackOptions = PartialBy<
  SkillOptions,
  'spriteId' | 'name' | 'shouldExhaustCaster'
> & {
  power: number;
  splash?: boolean;
};

export class MeleeAttack extends Skill {
  readonly id = 'melee_attack';

  public readonly power: number;
  public readonly splash: boolean;

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
    this.splash = options.splash ?? false;
  }

  getDescription(caster: SkillDescriptionContext) {
    const splash = this.splash ? ' and all enemies around it.' : '';
    return `Deals ${caster.attack + this.power} damage to a nearby enemy${splash}.`;
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
    const splashCondition = this.splash
      ? isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId) &&
        isWithinCells(ctx, targets[0], point, { x: 1, y: 1, z: 0.5 })
      : false;

    return (
      isSelf(
        ctx.entityManager.getEntityAt(targets[0])!,
        ctx.entityManager.getEntityAt(point)
      ) || splashCondition
    );
  }

  execute(ctx: GameSession, caster: Entity, targets: Point3D[], affectedCells: Cell[]) {
    ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.power,
          sourceId: caster.id,
          targets: affectedCells.map(target => ctx.entityManager.getEntityAt(target)!.id)
        },
        ctx
      )
    );
  }
}

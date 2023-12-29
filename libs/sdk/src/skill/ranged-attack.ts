import { isNumber } from 'lodash-es';
import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillDescriptionContext, SkillOptions } from './skill';
import { isSelf, isMinCells, isWithinCells } from './skill-utils';
import { PartialBy } from '@hc/shared';

export type RangedAttackOptions = PartialBy<
  SkillOptions,
  'spriteId' | 'name' | 'shouldExhaustCaster'
> & {
  power: number;
  minRange: number | Point3D;
  maxRange: number | Point3D;
};

export class RangedAttack extends Skill {
  readonly id = 'ranged_attack';

  public readonly power: number;
  public readonly minRange: number | Point3D;
  public readonly maxRange: number | Point3D;

  constructor(options: RangedAttackOptions) {
    super({
      animationFX: 'attack',
      soundFX: 'attack-placeholder',
      spriteId: options.spriteId ?? 'ranged_attack',
      name: options.name ?? 'Ranged attack',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
    this.power = options.power;
    this.minRange = options.minRange;
    this.maxRange = options.maxRange;
  }

  getDescription(caster: SkillDescriptionContext) {
    return `Deals ${
      caster.attack + this.power
    } damage to an enemy. Cannot be cast in melee range.`;
  }

  isMinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    const { x, y, z } = isNumber(this.minRange)
      ? { x: this.minRange, y: this.minRange, z: this.minRange }
      : this.minRange;

    return (
      isMinCells(ctx, caster.position, point, { x, y: 0, z: 0 }) ||
      isMinCells(ctx, caster.position, point, { x: 0, y, z: 0 }) ||
      isMinCells(ctx, caster.position, point, { x: 0, y: 0, z })
    );
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      isWithinCells(ctx, caster.position, point, this.maxRange) &&
      this.isMinRange(ctx, point, caster)
    );
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

import { PartialBy } from '@hc/shared';
import { AddEffectAction } from '../action/add-effect';
import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillOptions } from './skill';
import { isWithinCells, isSelf, isAxisAligned } from './skill-utils';

export type FireballOptions = PartialBy<SkillOptions, 'spriteId'> & {
  power: number;
  range: number;
  dotPower: number;
  dotDuration: number;
};
export class Fireball extends Skill {
  id = 'fireball';

  readonly power: number;
  readonly range: number;
  readonly dotDuration: number;
  readonly dotPower: number;

  constructor(options: FireballOptions) {
    super({
      spriteId: options.spriteId ?? 'fireball',
      maxTargets: 2,
      ...options
    });
    this.power = options.power;
    this.range = options.range;
    this.dotDuration = options.dotDuration;
    this.dotPower = options.dotPower;
  }

  getDescription(caster: Entity) {
    return `Deals ${caster.attack + this.power} damage to up to ${
      this.maxTargets
    } enemies, then ${this.dotPower} damage every turn for ${this.dotDuration} turns`;
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      isWithinCells(ctx, caster.position, point, this.range) &&
      isAxisAligned(point, caster.position)
    );
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      this.isWithinRange(ctx, point, caster) &&
      isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId)
    );
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, targets: Point3D[]) {
    return targets.some(target =>
      isSelf(
        ctx.entityManager.getEntityAt(target)!,
        ctx.entityManager.getEntityAt(point)!
      )
    );
  }

  execute(ctx: GameSession, caster: Entity, targets: Point3D[]) {
    const entities = targets.map(t => ctx.entityManager.getEntityAt(t)!);

    ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.power,
          sourceId: caster.id,
          targets: entities.map(e => e.id)
        },
        ctx
      )
    );
    entities.forEach(entity => {
      ctx.actionQueue.push(
        new AddEffectAction(
          {
            sourceId: caster.id,
            attachedTo: entity.id,
            effectId: 'dot',
            effectArg: { duration: this.dotDuration, power: this.dotPower }
          },
          ctx
        )
      );
    });
  }
}

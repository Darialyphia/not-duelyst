import { PartialBy } from '@hc/shared';
import { HealAction } from '../action/heal.action';
import { Entity } from '../entity/entity';
import { isAlly } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillOptions } from './skill';
import { isWithinCells } from './skill-utils';

export type HealOptions = PartialBy<SkillOptions, 'spriteId'> & {
  power: number;
  range: number;
};

export class Heal extends Skill {
  readonly id = 'heal';

  public readonly power: number;
  public readonly range: number;

  constructor(options: HealOptions) {
    super({ ...options, spriteId: options.spriteId ?? 'heal' });
    this.power = options.power;
    this.range = options.range;
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      isAlly(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId) &&
      isWithinCells(ctx, caster.position, point, this.range)
    );
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, target: Point3D) {
    return (
      isAlly(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId) &&
      isWithinCells(ctx, target, point, 0)
    );
  }

  execute(ctx: GameSession, caster: Entity, target: Point3D, affectedPoints: Point3D[]) {
    const entity = ctx.entityManager.getEntityAt(target)!;

    ctx.actionQueue.push(
      new HealAction(
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

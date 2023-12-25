import { PartialBy } from '@hc/shared';
import { HealAction } from '../action/heal.action';
import { Entity } from '../entity/entity';
import { isAlly } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillOptions } from './skill';
import { isWithinCells } from './skill-utils';

export type HealOptions = PartialBy<SkillOptions, 'spriteId' | 'name'> & {
  power: number;
  range: number;
};

export class Heal extends Skill {
  readonly id = 'heal';

  public readonly power: number;
  public readonly range: number;

  constructor(options: HealOptions) {
    super({
      ...options,
      spriteId: options.spriteId ?? 'heal',
      name: options.name ?? 'Heal'
    });
    this.power = options.power;
    this.range = options.range;
  }

  getDescription() {
    return `Heal ${this.power} damage from a ally unit.`;
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return isWithinCells(ctx, caster.position, point, this.range);
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      this.isWithinRange(ctx, point, caster) &&
      isAlly(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId)
    );
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, target: Point3D[]) {
    return (
      isAlly(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId) &&
      isWithinCells(ctx, target[0], point, 0)
    );
  }

  execute(ctx: GameSession, caster: Entity, [target]: Point3D[]) {
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

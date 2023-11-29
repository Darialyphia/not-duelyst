import { StrictBuilder } from 'builder-pattern';
import { Entity } from '../entity/entity';
import { GameContext } from '../game';
import { Point3D } from '../types';
import { Point } from '@hc/shared';

export type SkillId = string;

export type Skill = {
  id: SkillId;
  cost: number;
  cooldown: number;
  isTargetable(ctx: GameContext, point: Point3D, caster: Entity): boolean;
  isInAreaOfEffect(
    ctx: GameContext,
    point: Point3D,
    caster: Entity,
    target: Point3D
  ): boolean;
  execute(
    ctx: GameContext,
    caster: Entity,
    target: Point3D,
    affectedPoints: Point[]
  ): void;
};

export const skillBuilder = StrictBuilder<Skill>;

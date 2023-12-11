import { StrictBuilder } from 'builder-pattern';
import { Entity } from '../entity/entity';
import { Point3D } from '../types';
import { Point } from '@hc/shared';
import { GameSession } from '../game-session';

export type SkillId = string;

export type Skill = {
  id: SkillId;
  cost: number;
  cooldown: number;
  animationFX: string;
  soundFX: string;
  isTargetable(ctx: GameSession, point: Point3D, caster: Entity): boolean;
  isInAreaOfEffect(
    ctx: GameSession,
    /** The point to check */
    point: Point3D,
    caster: Entity,
    /** The point where the skill was casted */
    target: Point3D
  ): boolean;
  execute(
    ctx: GameSession,
    caster: Entity,
    target: Point3D,
    affectedPoints: Point[]
  ): void;
};

export const skillBuilder = StrictBuilder<Skill>;

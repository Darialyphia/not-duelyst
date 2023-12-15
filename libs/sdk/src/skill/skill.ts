import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Point3D } from '../types';

export type SkillId = string;

export type SkillOptions = {
  cost: number;
  animationFX?: string;
  soundFX?: string;
  cooldown: number;
};

export abstract class Skill {
  abstract readonly id: SkillId;
  readonly cost: number;
  readonly cooldown: number;
  readonly animationFX: string;
  readonly soundFX: string;

  constructor(options: SkillOptions) {
    this.cost = options.cost;
    this.cooldown = options.cooldown;
    this.animationFX = options.animationFX ?? 'cast';
    this.soundFX = options.soundFX ?? 'cast-placeholder';
  }

  abstract isTargetable(ctx: GameSession, point: Point3D, caster: Entity): boolean;

  abstract isInAreaOfEffect(
    ctx: GameSession,
    point: Point3D,
    caster: Entity,
    target: Point3D
  ): boolean;

  abstract execute(
    ctx: GameSession,
    caster: Entity,
    target: Point3D,
    affectedPoints: Point3D[]
  ): void;

  fxImpl(ctx: GameSession, caster: Entity, target: Point3D, affectedPoints: Point3D[]) {
    return Promise.resolve();
  }
}

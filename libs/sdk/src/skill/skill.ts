import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Point3D } from '../types';

export type SkillId = string;

export type SkillOptions = {
  cost: number;
  name: string;
  animationFX?: string;
  soundFX?: string;
  spriteId: string;
  cooldown: number;
  shouldExhaustCaster: boolean;
  shouldPreventMovement?: boolean;
  minTargets?: number;
  maxTargets?: number;
};

export type SkillDescriptionContext = {
  attack: number;
  defense: number;
  speed: number;
};

export abstract class Skill {
  abstract readonly id: SkillId;
  readonly name: string;
  readonly cost: number;
  readonly cooldown: number;
  readonly animationFX: string;
  readonly soundFX: string;
  readonly spriteId: string;
  readonly minTargets: number;
  readonly maxTargets: number;
  readonly shouldExhaustCaster: boolean;
  readonly shouldPreventMovement: boolean;

  constructor(options: SkillOptions) {
    this.name = options.name;
    this.cost = options.cost;
    this.cooldown = options.cooldown;
    this.animationFX = options.animationFX ?? 'cast';
    this.soundFX = options.soundFX ?? 'cast-placeholder';
    this.spriteId = options.spriteId;
    this.minTargets = options.minTargets ?? 1;
    this.maxTargets = options.maxTargets ?? 1;
    this.shouldExhaustCaster = options.shouldExhaustCaster;
    this.shouldPreventMovement = options.shouldPreventMovement ?? true;
  }

  abstract getDescription(caster: SkillDescriptionContext): string;

  getText(caster: SkillDescriptionContext) {
    return `${this.getDescription(caster)}${
      this.shouldExhaustCaster ? '' : '\nDoes not exhaust.'
    }`;
  }

  abstract isTargetable(
    ctx: GameSession,
    point: Point3D,
    caster: Entity,
    targets: Point3D[]
  ): boolean;

  abstract isWithinRange(
    ctx: GameSession,
    point: Point3D,
    caster: Entity,
    targets: Point3D[]
  ): boolean;

  abstract isInAreaOfEffect(
    ctx: GameSession,
    point: Point3D,
    caster: Entity,
    targets: Point3D[]
  ): boolean;

  abstract execute(
    ctx: GameSession,
    caster: Entity,
    targets: Point3D[],
    affectedPoints: Point3D[]
  ): void;

  fxImpl(
    ctx: GameSession,
    caster: Entity,
    targets: Point3D[],
    affectedPoints: Point3D[]
  ) {
    return Promise.resolve();
  }
}

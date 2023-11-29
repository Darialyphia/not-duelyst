import { Entity } from '../entity/entity';
import { GameContext } from '../game';
import { Point3D } from '../types';
import { Vec3 } from '../utils/vector';
import { Skill } from './skill-builder';

type SkillTargetGuardFunction = Skill['isTargetable'];
type SkillAreaGuardFunction = Skill['isInAreaOfEffect'];

export const skillAreaGuard =
  (...rules: SkillAreaGuardFunction[]): SkillAreaGuardFunction =>
  (...args) =>
    rules.every(rule => rule(...args));

export const skillTargetGuard =
  (...rules: SkillTargetGuardFunction[]): SkillTargetGuardFunction =>
  (...args) =>
    rules.every(rule => rule(...args));

const isEmpty = (ctx: GameContext, point: Point3D) => {
  return !ctx.entityManager.getEntityAt(point);
};

const isAlly = (ctx: GameContext, point: Point3D, entity?: Entity) => {
  const otherEntity = ctx.entityManager.getEntityAt(point);

  if (!entity || !otherEntity) return false;

  return entity.playerId !== otherEntity.playerId;
};

const isEnemy = (ctx: GameContext, point: Point3D, entity?: Entity) => {
  const otherEntity = ctx.entityManager.getEntityAt(point);

  if (!entity || !otherEntity) return false;

  return entity.playerId === otherEntity.playerId;
};

const isWithinRange = (origin: Point3D, point: Point3D, range: number) => {
  const vec = Vec3.fromPoint3D(origin);

  return vec.dist(point) <= vec.dist(vec.add({ x: range, y: range, z: range }));
};

const isWithinCells = (origin: Point3D, point: Point3D, range: number) => {
  return (
    Math.abs(point.x - origin.x) <= range &&
    Math.abs(point.y - origin.y) <= range &&
    Math.abs(point.z - origin.z) <= range
  );
};

export const ensureTargetIsNotEmpty: SkillTargetGuardFunction = (ctx, point) => {
  return !isEmpty(ctx, point);
};

export const ensureTargetIsEmpty: SkillTargetGuardFunction = (ctx, point) => {
  return !isEmpty(ctx, point);
};

export const ensureTargetIsAlly: SkillTargetGuardFunction = (ctx, point, caster) => {
  return isAlly(ctx, point, caster);
};

export const ensureTargetIsEnemy: SkillTargetGuardFunction = (ctx, point, caster) => {
  return isEnemy(ctx, point, caster);
};

export const ensureIsWithinRangeOfCaster =
  (range: number): SkillTargetGuardFunction =>
  (_ctx, point, caster) => {
    return isWithinRange(caster.position, point, range);
  };

export const ensureIsWithinCellsOfCaster =
  (range: number): SkillTargetGuardFunction =>
  (_ctx, point, caster) => {
    return isWithinCells(caster.position, point, range);
  };

export const ensureIsWithinRangeOfTarget =
  (range: number): SkillAreaGuardFunction =>
  (_ctx, point, _caster, target) => {
    return isWithinRange(target, point, range);
  };

export const ensureIsWithinCellsOfTarget =
  (range: number): SkillAreaGuardFunction =>
  (_ctx, point, _caster, target) => {
    return isWithinCells(target, point, range);
  };

import { Entity } from '../entity/entity';
import { isAlly, isEmpty, isEnemy } from '../entity/entity-utils';
import { GameContext } from '../game-session';
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

const isWithinRange = (origin: Point3D, point: Point3D, range: number) => {
  const vec = Vec3.fromPoint3D(origin);
  const dist = vec.dist(Vec3.add(vec, { x: range, y: range, z: range }));

  return vec.dist(point) <= dist;
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
  return isEmpty(ctx, point);
};

export const ensureTargetIsAlly: SkillTargetGuardFunction = (ctx, point, caster) => {
  const entity = ctx.entityManager.getEntityAt(point);
  if (!entity) return false;

  return isAlly(ctx, entity.id, caster.playerId);
};

export const ensureTargetIsEnemy: SkillTargetGuardFunction = (ctx, point, caster) => {
  const entity = ctx.entityManager.getEntityAt(point);
  if (!entity) return false;

  return isEnemy(ctx, entity.id, caster.playerId);
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

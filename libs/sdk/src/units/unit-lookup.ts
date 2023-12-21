import { Faction } from '../faction/faction-lookup';
import { keyBy } from 'lodash-es';
import { Skill } from '../skill/skill';
import { UnitKind } from './constants';
import { HAVEN_UNITS } from './haven.units';
import { CHAOS_UNITS } from './chaos.units';
import { Point3D } from '../types';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';

export type UnitId = string;

export const isUnitId = (str: string): str is UnitId => Object.keys(UNITS).includes(str);

export type UnitBlueprint = {
  id: string;
  spriteId: string;
  kind: UnitKind;
  faction: Faction;

  summonCost: number;
  summonCooldown: number;

  maxHp: number;

  maxAp: number;
  apRegenRate: number;

  attack: number;
  defense: number;
  speed: number;
  initiative: number;

  skills: Array<Skill>;

  // onPlay?: {
  //   targetCount: number;
  //   isTargetable(ctx: GameSession, point: Point3D, caster: Entity): boolean;
  // };
};

export const UNITS = keyBy([...HAVEN_UNITS, ...CHAOS_UNITS], 'id') satisfies Record<
  UnitId,
  UnitBlueprint
>;

import { Values } from '@hc/shared';
import { Faction, FACTIONS } from '../faction/faction-lookup';
import { keyBy } from 'lodash-es';
import { Skill, skillBuilder } from '../skill/skill-builder';
import {
  ensureTargetIsEnemy,
  ensureIsWithinCellsOfTarget,
  ensureIsWithinCellsOfCaster,
  skillAreaGuard,
  skillTargetGuard,
  ensureIsAxisAlignedWithCaster,
  ensureSelfCast,
  ensureTargetIsSelf
} from '../skill/skill-utils';
import { DealDamageAction } from '../action/deal-damage.action';
import { AddTriggerAction } from '../action/add-trigger';
import { UnitKind } from './constants';
import { HAVEN_UNITS } from './haven.units';

export type UnitId = string;

export const isUnitId = (str: string): str is UnitId => Object.keys(UNITS).includes(str);

export type UnitBlueprint = {
  id: string;
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
};

export const UNITS = keyBy([...HAVEN_UNITS], 'id') satisfies Record<
  UnitId,
  UnitBlueprint
>;

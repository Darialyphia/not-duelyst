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
  ensureIsAxisAlignedWithCaster
} from '../skill/skill-utils';
import { DealDamageAction } from '../action/deal-damage.action';

export const UNIT_KIND = {
  GENERAL: 'GENERAL',
  SOLDIER: 'SOLDIER'
} as const;

export type UnitKind = Values<typeof UNIT_KIND>;

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

export const UNITS = keyBy(
  [
    {
      id: 'haven_general_1',
      kind: UNIT_KIND.GENERAL,
      faction: FACTIONS.haven,
      summonCost: 0,
      summonCooldown: 0,
      maxHp: 25,
      maxAp: 4,
      apRegenRate: 1,
      attack: 4,
      defense: 1,
      speed: 5,
      initiative: 8,
      skills: [
        skillBuilder()
          .id('melee_attack')
          .cost(0)
          .cooldown(1)
          .isTargetable(
            skillTargetGuard(
              ensureTargetIsEnemy,
              ensureIsWithinCellsOfCaster(1),
              ensureIsAxisAlignedWithCaster
            )
          )
          .isInAreaOfEffect(
            skillAreaGuard(ensureTargetIsEnemy, ensureIsWithinCellsOfTarget(0))
          )
          .execute((ctx, caster, target) => {
            const entity = ctx.entityManager.getEntityAt(target)!;

            new DealDamageAction(
              {
                amount: 1,
                sourceId: caster.id,
                targets: [entity.id]
              },
              ctx
            ).execute();
          })
          .build()
      ]
    },
    {
      id: 'haven_soldier_1',
      kind: UNIT_KIND.SOLDIER,
      faction: FACTIONS.haven,
      summonCost: 1,
      summonCooldown: 1,
      maxHp: 10,
      maxAp: 3,
      apRegenRate: 1,
      attack: 2,
      defense: 0,
      speed: 5,
      initiative: 7,
      skills: [
        skillBuilder()
          .id('melee_attack')
          .cost(0)
          .cooldown(1)
          .isTargetable(
            skillTargetGuard(
              ensureTargetIsEnemy,
              ensureIsWithinCellsOfCaster(1),
              ensureIsAxisAlignedWithCaster
            )
          )
          .isInAreaOfEffect(
            skillAreaGuard(ensureTargetIsEnemy, ensureIsWithinCellsOfTarget(0))
          )
          .execute((ctx, caster, target) => {
            const entity = ctx.entityManager.getEntityAt(target)!;

            new DealDamageAction(
              {
                amount: 1,
                sourceId: caster.id,
                targets: [entity.id]
              },
              ctx
            ).execute();
          })
          .build()
      ]
    }
  ],
  'id'
) satisfies Record<UnitId, UnitBlueprint>;

import { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { FACTIONS, UNITS } from '@hc/sdk';

export const ensureNoDuplicates = (units: string[]) => {
  if (new Set(units).size !== units.length) {
    throw new Error('Loadout has duplicate cards.');
  }
};

export const ensureOwnsUnit = async (
  { db }: { db: MutationCtx['db'] },
  userId: Id<'users'>,
  unitId: string
) => {
  const exists = await db
    .query('collectionItems')
    .withIndex('by_item_id', q => q.eq('itemId', unitId))
    .filter(q => q.eq(q.field('ownerId'), userId));

  if (!exists) {
    throw new Error(`User does not own unit ${unitId}`);
  }
};

export const ensureUnitExist = (unitId: string) => {
  const unit = UNITS[unitId];
  if (!unit) {
    throw new Error(`Unit not found: ${unitId}`);
  }

  return unit;
};

export const ensureLoadoutUnitsMatchWithGeneral = (
  generalId: string,
  unitIds: string[]
) => {
  const general = ensureUnitExist(generalId);
  const isValid = unitIds.every(unitId => {
    const unit = ensureUnitExist(unitId);
    return unit.faction === general.faction || unit.faction === FACTIONS.neutral;
  });

  if (!isValid) {
    throw new Error("Illegal loadout : some units do not match the general's faction");
  }
};

export const validateLoadout = async (
  { db }: { db: MutationCtx['db'] },
  {
    userId,
    unitIds,
    generalId
  }: { unitIds: string[]; userId: Id<'users'>; generalId: string }
) => {
  await Promise.all(unitIds.map(unit => ensureOwnsUnit({ db }, userId, unit)));
  ensureNoDuplicates(unitIds);
  ensureLoadoutUnitsMatchWithGeneral(generalId, unitIds);
};

export const ensureLoadoutExists = async (
  { db }: { db: QueryCtx['db'] },
  loadoutId: Id<'loadouts'>
) => {
  const loadout = await db.get(loadoutId);
  if (!loadout) throw new Error(`Loadout not found: ${loadoutId}`);

  return loadout;
};

export const ensureOwnsLoadout = (loadout: Doc<'loadouts'>, userId: Id<'users'>) => {
  if (loadout.ownerId !== userId) {
    throw new Error('You do not have write access to this loadoug.');
  }
};

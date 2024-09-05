import type { GenericSerializedBlueprint } from '@game/sdk';
import type { Id } from '../_generated/dataModel';
import type { MutationCtx } from '../_generated/server';

export const grantCards = async (
  { db }: { db: MutationCtx['db'] },
  { userId, cards }: { userId: Id<'users'>; cards: GenericSerializedBlueprint[] }
) => {
  const collection = await db
    .query('collectionItems')
    .withIndex('by_owner_id', q => q.eq('ownerId', userId))
    .collect();

  const unitsToAdd = cards.filter(
    unit => unit.collectable && !collection.some(item => item.itemId === unit.id)
  );

  await Promise.all(
    unitsToAdd.map(unit =>
      db.insert('collectionItems', {
        itemId: unit.id,
        ownerId: userId,
        grantedAt: Date.now(),
        pedestalId: 'pedestal-default',
        cardBackId: 'default'
      })
    )
  );
  return unitsToAdd;
};

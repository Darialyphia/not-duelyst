import { v } from 'convex/values';
import { internalMutation, query } from './_generated/server';
import { UNITS } from '@hc/sdk';
import { ensureAuthenticated } from './utils/auth';
import { ensureUserExists } from './users/user.utils';
import { toLCollectionItemDto } from './collection/collection.utils';

export const grantAllCollection = internalMutation({
  args: {
    userId: v.id('users')
  },
  async handler(ctx, args) {
    const collection = await ctx.db
      .query('collectionItems')
      .withIndex('by_owner_id', q => q.eq('ownerId', args.userId))
      .collect();

    const unitsToAdd = Object.values(UNITS).filter(
      unit => !collection.some(item => item.itemId === unit.id)
    );

    return Promise.all(
      unitsToAdd.map(unit =>
        ctx.db.insert('collectionItems', {
          itemId: unit.id,
          ownerId: args.userId
        })
      )
    );
  }
});

export const myCollection = query(async ctx => {
  const identity = await ensureAuthenticated(ctx);
  const user = await ensureUserExists(ctx, identity.tokenIdentifier);

  const collection = await ctx.db
    .query('collectionItems')
    .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
    .collect();

  return collection.map(toLCollectionItemDto);
});

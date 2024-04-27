import { v } from 'convex/values';
import {
  ensureLoadoutExists,
  ensureOwnsLoadout,
  validateLoadout
} from './loadout/loadout.utils';
import { toLoadoutDto } from './loadout/loadout.mapper';
import { ensureAuthenticated, mutationWithAuth, queryWithAuth } from './auth/auth.utils';

export const create = mutationWithAuth({
  args: {
    name: v.string(),
    cards: v.array(v.object({ id: v.string(), pedestalId: v.string() }))
  },
  async handler(ctx, args) {
    const user = ensureAuthenticated(ctx.session);

    const validData = await validateLoadout(ctx, {
      ownerId: user._id,
      cards: args.cards
    });

    ctx.db.insert('loadouts', {
      ...validData,
      name: args.name
    });
  }
});

export const update = mutationWithAuth({
  args: {
    loadoutId: v.id('loadouts'),
    name: v.string(),
    cards: v.array(v.object({ id: v.string(), pedestalId: v.string() }))
  },
  async handler(ctx, args) {
    const user = ensureAuthenticated(ctx.session);
    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);
    await ensureOwnsLoadout(loadout, user._id);

    const validData = await validateLoadout(ctx, {
      ownerId: user._id,
      cards: args.cards
    });

    ctx.db.replace(args.loadoutId, {
      ...validData,
      name: args.name
    });
  }
});

export const remove = mutationWithAuth({
  args: {
    loadoutId: v.id('loadouts')
  },
  async handler(ctx, args) {
    const user = await ensureAuthenticated(ctx.session);
    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);
    await ensureOwnsLoadout(loadout, user._id);

    ctx.db.delete(args.loadoutId);
  }
});

export const myLoadouts = queryWithAuth({
  args: {},
  handler: async ctx => {
    const user = await ensureAuthenticated(ctx.session);

    const loadouts = await ctx.db
      .query('loadouts')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .collect();

    return loadouts.map(toLoadoutDto);
  }
});

export const getById = queryWithAuth({
  args: {
    loadoutId: v.id('loadouts')
  },
  async handler(ctx, args) {
    const user = await ensureAuthenticated(ctx.session);
    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);

    ensureOwnsLoadout(loadout, user._id);

    return toLoadoutDto(loadout);
  }
});

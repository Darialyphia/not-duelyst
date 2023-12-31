import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { ensureAuthenticated } from './utils/auth';
import { ensureUserExists } from './users/user.utils';
import {
  ensureLoadoutExists,
  ensureOwnsLoadout,
  validateLoadout
} from './loadout/loadout.utils';
import { toLoadoutDto } from './loadout/loadout.mapper';

export const create = mutation({
  args: {
    name: v.string(),
    generalId: v.string(),
    units: v.array(v.string())
  },
  async handler(ctx, args) {
    const identity = await ensureAuthenticated(ctx);
    const user = await ensureUserExists(ctx, identity.tokenIdentifier);
    await validateLoadout(ctx, {
      userId: user._id,
      generalId: args.generalId,
      unitIds: args.units
    });
    ctx.db.insert('loadouts', { ...args, ownerId: user._id });
  }
});

export const update = mutation({
  args: {
    loadoutId: v.id('loadouts'),
    name: v.string(),
    generalId: v.string(),
    units: v.array(v.string())
  },
  async handler(ctx, args) {
    const identity = await ensureAuthenticated(ctx);
    const user = await ensureUserExists(ctx, identity.tokenIdentifier);
    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);
    await ensureOwnsLoadout(loadout, user._id);

    await validateLoadout(ctx, {
      userId: user._id,
      generalId: args.generalId,
      unitIds: args.units
    });

    const { loadoutId, ...body } = args;
    ctx.db.replace(loadoutId, { ...body, ownerId: user._id });
  }
});

export const remove = mutation({
  args: {
    loadoutId: v.id('loadouts')
  },
  async handler(ctx, args) {
    const identity = await ensureAuthenticated(ctx);
    const user = await ensureUserExists(ctx, identity.tokenIdentifier);
    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);
    await ensureOwnsLoadout(loadout, user._id);

    ctx.db.delete(args.loadoutId);
  }
});

export const myLoadouts = query(async ctx => {
  const identity = await ensureAuthenticated(ctx);
  const user = await ensureUserExists(ctx, identity.tokenIdentifier);

  const loadouts = await ctx.db
    .query('loadouts')
    .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
    .collect();

  return loadouts.map(toLoadoutDto);
});

export const getById = query({
  args: {
    loadoutId: v.id('loadouts')
  },
  async handler(ctx, args) {
    const identity = await ensureAuthenticated(ctx);
    const user = await ensureUserExists(ctx, identity.tokenIdentifier);
    const loadout = await ensureLoadoutExists(ctx, args.loadoutId);

    ensureOwnsLoadout(loadout, user._id);

    return toLoadoutDto(loadout);
  }
});

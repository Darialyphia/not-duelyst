import { v } from 'convex/values';
import { mutationWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import {
  ensureLoadoutExists,
  ensureOwnsLoadout,
  validateLoadout
} from '../loadout.utils';

export const updateLoadoutUsecase = mutationWithAuth({
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

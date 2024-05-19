import { v } from 'convex/values';
import { mutationWithAuth, ensureAuthenticated } from '../../auth/auth.utils';
import { validateLoadout } from '../loadout.utils';

export const createLoadoutUsecase = mutationWithAuth({
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

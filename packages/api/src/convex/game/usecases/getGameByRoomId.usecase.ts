import { v } from 'convex/values';
import { query } from '../../_generated/server';
import { toGameDetailsDto } from '../game.mapper';
import { getGameByRoomId } from '../game.utils';
import { defaultFormat } from '../../formats/format.utils';
import { authedQuery } from '../../auth/auth.utils';

export const getGameByRoomIdUsecase = authedQuery({
  args: {
    roomId: v.string()
  },
  async handler(ctx, args) {
    const game = await getGameByRoomId(ctx, args.roomId);
    if (!game) return null;
    const format = game.formatId ? await ctx.db.get(game.formatId) : defaultFormat;

    if (!format) throw Error('Could not find game format');
    return toGameDetailsDto({ ...game, format });
  }
});

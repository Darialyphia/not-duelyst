import { v } from 'convex/values';
import { toGameDetailsDto } from '../game.mapper';
import { getGameByRoomId } from '../game.utils';
import { authedQuery } from '../../auth/auth.utils';

export const getGameByRoomIdUsecase = authedQuery({
  args: {
    roomId: v.string()
  },
  async handler(ctx, args) {
    const game = await getGameByRoomId(ctx, args.roomId);
    if (!game) return null;

    return toGameDetailsDto(game);
  }
});

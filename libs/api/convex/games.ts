import { randomInt } from '@hc/shared';
// eslint-disable-next-line import/no-unresolved
import { Id } from './_generated/dataModel';
import { query, mutation, internalAction, internalMutation } from './_generated/server';
import { toUserDto } from './users/user.mapper';
import { findMe } from './users/user.utils';
import { ensureAuthenticated } from './utils/auth';
import { Validator, v } from 'convex/values';
import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import { Region } from '@hathora/cloud-sdk-typescript/dist/sdk/models/shared';

export const getRoomId = internalAction(async () => {
  if (!process.env.HATHORA_TOKEN) return 'dev';
  const hathoraSdk = new HathoraCloud({
    appId: process.env.HATHORA_APP_ID,
    security: {
      hathoraDevToken: process.env.HATHORA_TOKEN!
    }
  });

  const room = await hathoraSdk.roomV2.createRoom({ region: Region.London });
  if (room.statusCode !== 200) throw new Error('could not get room Id from Hathora');
  return room.connectionInfoV2!.roomId;
});

export const create = internalMutation({
  args: {
    playersIds: v.array(v.id('users')) as Validator<[Id<'users'>, Id<'users'>]>,
    roomId: v.string()
  },
  async handler(ctx, arg) {
    const maps = await ctx.db.query('gameMaps').collect();

    const firstPlayerIndex = Math.round(Math.random());
    const mapIndex = randomInt(maps.length - 1);

    const gameId = await ctx.db.insert('games', {
      firstPlayer: arg.playersIds[firstPlayerIndex],
      mapId: maps[mapIndex]._id,
      status: 'WAITING_FOR_PLAYERS',
      roomId: arg.roomId
    });

    await Promise.all(
      arg.playersIds.map(playerId =>
        ctx.db.insert('gamePlayers', {
          gameId,
          userId: playerId
        })
      )
    );
  }
});

export const getCurrent = query(async ctx => {
  await ensureAuthenticated(ctx);
  const user = await findMe(ctx);

  const currentGameUser = await ctx.db
    .query('gamePlayers')
    .withIndex('by_creation_time')
    .filter(q => q.eq(q.field('userId'), user!._id))
    .order('desc')
    .first();

  if (!currentGameUser) return null;

  const game = await ctx.db.get(currentGameUser?.gameId);
  if (!game) return null;

  const gamePlayers = await ctx.db
    .query('gamePlayers')
    .withIndex('by_game_id', q => q.eq('gameId', game?._id))
    .collect();

  return {
    ...game,
    players: await Promise.all(
      gamePlayers.map(async gamePlayer => {
        const user = await ctx.db.get(gamePlayer.userId);
        return toUserDto(user!);
      })
    )
  };
});

export const start = mutation({
  args: {
    gameId: v.id('games')
  },
  async handler(ctx, args) {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error('Not Found');
    if (game?.status !== 'WAITING_FOR_PLAYERS') {
      throw new Error('Game is already started');
    }

    return ctx.db.patch(game._id, { status: 'ONGOING' });
  }
});

export const end = mutation({
  args: {
    gameId: v.id('games'),
    winnerId: v.id('users')
  },
  async handler(ctx, args) {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error('Not Found');
    if (game?.status !== 'ONGOING') {
      throw new Error('Game is not ongoing');
    }

    const gamePlayer = await ctx.db
      .query('gamePlayers')
      .withIndex('by_user_id', q => q.eq('userId', args.winnerId))
      .filter(q => q.eq(q.field('gameId'), args.gameId))
      .unique();

    return ctx.db.patch(game._id, { status: 'FINISHED', winnerId: gamePlayer!._id });
  }
});

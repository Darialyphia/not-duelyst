import { randomInt } from '@hc/shared';
import { Id } from '../_generated/dataModel';
import type { QueryCtx } from '../_generated/server';
import { GAME_STATUS, GameStatus } from './game.constants';

export const getCurrentGame = async (
  { db }: { db: QueryCtx['db'] },
  userId: Id<'users'>
) => {
  const currentGameUser = await db
    .query('gamePlayers')
    .withIndex('by_creation_time')
    .filter(q => q.eq(q.field('userId'), userId))
    .order('desc')
    .first();

  if (!currentGameUser) return null;

  const game = await db.get(currentGameUser?.gameId);
  if (!game) return null;
  if (game.status === 'FINISHED') return null;

  const gamePlayers = await db
    .query('gamePlayers')
    .withIndex('by_game_id', q => q.eq('gameId', game?._id))
    .collect();

  return {
    ...game,
    players: await Promise.all(gamePlayers.map(gamePlayer => db.get(gamePlayer.userId)))
  };
};

export const ensureHasNoCurrentGame = async (
  { db }: { db: QueryCtx['db'] },
  userId: Id<'users'>
) => {
  const game = await getCurrentGame({ db }, userId);
  if (game) throw new Error('Already in game');
};

export const getGameInitialState = async (
  { db }: { db: QueryCtx['db'] },
  playerIds: Id<'users'>[]
) => {
  const maps = await db.query('gameMaps').collect();
  const firstPlayerIndex = Math.round(Math.random());
  const mapIndex = randomInt(maps.length - 1);

  return {
    firstPlayer: playerIds[firstPlayerIndex],
    mapId: maps[mapIndex]._id,
    status: GAME_STATUS.WAITING_FOR_PLAYERS
  };
};

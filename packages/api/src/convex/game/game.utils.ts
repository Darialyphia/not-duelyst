import { randomInt } from '@game/shared';
import type { Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { GAME_STATUS } from './game.constants';
import type { Game } from './game.entity';
import { parse } from 'zipson';
import { toGameDto } from './game.mapper';
import { internal } from '../_generated/api';
import type { SerializedGameState } from '@game/sdk';
import { defaultFormat } from '../formats/format.utils';

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

  return toGameDto({
    ...game,
    players: await getGamePlayers({ db }, game)
  });
};

export const ensureHasNoCurrentGame = async (
  { db }: { db: QueryCtx['db'] },
  userId: Id<'users'>
) => {
  const game = await getCurrentGame({ db }, userId);
  if (!game) return;
  if (game.status !== 'FINISHED' && game.status !== 'CANCELLED') {
    throw new Error('Already in game');
  }
};

export const getGameInitialState = async (
  { db }: { db: QueryCtx['db'] },
  playerIds: Id<'users'>[]
) => {
  const maps = await db.query('gameMaps').collect();
  const firstPlayerIndex = Math.round(Math.random());
  const mapIndex = randomInt(maps.length - 1);
  const seed = (Math.random() + 1).toString(36).substring(2);

  return {
    firstPlayer: playerIds[firstPlayerIndex],
    mapId: maps[mapIndex]._id,
    status: GAME_STATUS.WAITING_FOR_PLAYERS,
    seed
  };
};

export const getGameById = async ({ db }: { db: QueryCtx['db'] }, id: Id<'games'>) => {
  const game = await db.get(id);
  if (!game) return null;

  return {
    ...game,
    players: await getGamePlayers({ db }, game)
  };
};

export const getGamePlayers = async ({ db }: { db: QueryCtx['db'] }, game: Game) => {
  const gamePlayers = await db
    .query('gamePlayers')
    .withIndex('by_game_id', q => q.eq('gameId', game?._id))
    .collect();

  return await Promise.all(
    gamePlayers.map(async gamePlayer => {
      const user = await db.get(gamePlayer.userId);
      if (!user) throw new Error('User not found');
      const loadout = await db.get(gamePlayer.loadoutId);
      if (!loadout) throw new Error('Loadout not found');

      return {
        ...user,
        gamePlayerId: gamePlayer._id,
        loadout: loadout
      };
    })
  );
};

export const getReplayInitialState = async (
  { db }: { db: QueryCtx['db'] },
  game: Game
): Promise<SerializedGameState> => {
  const players = (await getGamePlayers({ db }, game)).sort(a =>
    a._id === game.firstPlayer ? -1 : 1
  );

  const map = await db.get(game.mapId);

  return {
    history: [],
    entities: [],
    players: [
      {
        id: players[0]._id,
        isPlayer1: true,
        name: players[0].name!,
        currentGold: defaultFormat.config.PLAYER_1_STARTING_GOLD,
        maxGold: defaultFormat.config.PLAYER_1_STARTING_GOLD,
        deck: players[0].loadout!.cards.map(({ id, pedestalId, cardBackId }) => ({
          pedestalId,
          cardBackId,
          blueprintId: id
        })),
        graveyard: []
      },
      {
        id: players[1]._id,
        isPlayer1: false,
        name: players[1].name!,
        currentGold: defaultFormat.config.PLAYER_1_STARTING_GOLD,
        maxGold: defaultFormat.config.PLAYER_1_STARTING_GOLD,
        deck: players[1].loadout!.cards.map(({ id, pedestalId, cardBackId }) => ({
          pedestalId,
          cardBackId,
          blueprintId: id
        })),
        graveyard: []
      }
    ],
    map: {
      width: map!.width,
      height: map!.height,
      player1StartPosition: map!.startPositions[0],
      player2StartPosition: map!.startPositions[1],
      cells: parse(map!.cells)
    },
    rng: {
      values: []
    }
  };
};

export const createGame = async (
  ctx: { scheduler: MutationCtx['scheduler']; db: MutationCtx['db'] },
  arg: {
    roomId: string;
    players: Array<{ userId: Id<'users'>; loadoutId: Id<'loadouts'> }>;
  }
) => {
  const { mapId, firstPlayer, status, seed } = await getGameInitialState(
    ctx,
    arg.players.map(p => p.userId)
  );

  const gameId = await ctx.db.insert('games', {
    firstPlayer,
    mapId,
    status,
    seed,
    roomId: arg.roomId
  });

  await Promise.all(
    arg.players.map(({ userId, loadoutId }) =>
      ctx.db.insert('gamePlayers', {
        loadoutId,
        gameId,
        userId
      })
    )
  );

  ctx.scheduler.runAfter(45_000, internal.games.timeout, { roomId: arg.roomId });
};

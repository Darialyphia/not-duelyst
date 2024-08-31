import { randomInt } from '@game/shared';
import type { Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { GAME_STATUS } from './game.constants';
import type { Game } from './game.entity';
import { parse } from 'zipson';
import { toGameDto } from './game.mapper';
import { internal } from '../_generated/api';
import { CARDS, type SerializedGameState } from '@game/sdk';
import { defaultFormat } from '../formats/format.utils';
import type { SerializedPlayer } from '@game/sdk/src/player/player';

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

export const getGameInitialState = async ({ db }: { db: QueryCtx['db'] }) => {
  const maps = await db.query('gameMaps').collect();
  const firstPlayerIndex = Math.round(Math.random());
  const mapIndex = randomInt(maps.length - 1);
  const seed = (Math.random() + 1).toString(36).substring(2);

  return {
    firstPlayerIndex,
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

export const getGameByRoomId = async ({ db }: { db: QueryCtx['db'] }, roomId: string) => {
  const game = await db
    .query('games')
    .withIndex('by_roomId', q => q.eq('roomId', roomId))
    .unique();
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
  const map = await db.get(game.mapId);

  return {
    history: [],
    entities: [],
    players: game.cachedPlayers.map(p => ({
      id: p.id,
      isPlayer1: p.isPlayer1,
      name: p.name,
      deck: p.deck,
      currentGold: defaultFormat.config.PLAYER_1_STARTING_GOLD,
      maxGold: defaultFormat.config.PLAYER_1_STARTING_GOLD,
      graveyard: []
    })) as unknown as [SerializedPlayer, SerializedPlayer],
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
    formatId?: Id<'formats'>;
  }
) => {
  const { mapId, firstPlayerIndex, status, seed } = await getGameInitialState(ctx);

  const players = await Promise.all(arg.players.map(p => ctx.db.get(p.userId)));
  const format = arg.formatId ? await ctx.db.get(arg.formatId) : defaultFormat;
  const playerLoaouts = await Promise.all(arg.players.map(p => ctx.db.get(p.loadoutId)));
  const gameId = await ctx.db.insert('games', {
    mapId,
    status,
    seed,
    roomId: arg.roomId,
    formatId: arg.formatId,
    cachedFormat: {
      config: format!.config,
      cards: JSON.stringify({ ...CARDS, ...JSON.parse(format!.cards) })
    },
    cachedPlayers: arg.players.map((_, index) => ({
      isPlayer1: index === firstPlayerIndex,
      id: players[index]!._id,
      name: players[index]!.name!,
      deck: playerLoaouts[index]!.cards.map(({ id, cardBackId, pedestalId }) => ({
        pedestalId,
        cardBackId,
        blueprintId: id
      }))
    }))
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
  return gameId;
};

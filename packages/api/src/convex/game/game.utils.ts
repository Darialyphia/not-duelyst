import type { Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import { GAME_STATUS } from './game.constants';
import type { Game } from './game.entity';
import { internal } from '../_generated/api';
import { CARDS, type SerializedGameState } from '@game/sdk';
import { defaultFormat } from '../formats/format.utils';
import type { SerializedPlayer } from '@game/sdk/src/player/player';
import { parse, stringify } from 'zipson';

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

  return getGameById({ db }, currentGameUser.gameId);
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

export const getGameInitialState = async () => {
  const firstPlayerIndex = Math.round(Math.random());
  const seed = (Math.random() + 1).toString(36).substring(2);

  return {
    firstPlayerIndex,
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

export const getReplayInitialState = async (game: Game): Promise<SerializedGameState> => {
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
    private: boolean;
  }
) => {
  const { firstPlayerIndex, status, seed } = await getGameInitialState();

  const players = await Promise.all(arg.players.map(p => ctx.db.get(p.userId)));
  const format = arg.formatId ? await ctx.db.get(arg.formatId) : defaultFormat;
  const playerLoaouts = await Promise.all(arg.players.map(p => ctx.db.get(p.loadoutId)));
  const gameId = await ctx.db.insert('games', {
    status,
    seed,
    private: arg.private,
    roomId: arg.roomId,
    formatId: arg.formatId,
    cachedFormat: {
      config: format!.config,
      map: format!.map ?? defaultFormat.map,
      cards: stringify({ ...CARDS, ...parse(format!.cards) })
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

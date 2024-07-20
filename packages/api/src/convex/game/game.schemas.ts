import { defineTable } from 'convex/server';
import { v, type Validator } from 'convex/values';
import { GAME_STATUS, type GameStatus } from './game.constants';

export const gameSchemas = {
  games: defineTable({
    seed: v.string(),
    firstPlayer: v.id('users'),
    mapId: v.id('gameMaps'),
    status: v.union(
      v.literal(GAME_STATUS.CANCELLED),
      v.literal(GAME_STATUS.FINISHED),
      v.literal(GAME_STATUS.ONGOING),
      v.literal(GAME_STATUS.WAITING_FOR_PLAYERS)
    ) as Validator<GameStatus>,
    roomId: v.string(),
    winnerId: v.optional(v.id('gamePlayers'))
  })
    .index('by_status', ['status'])
    .index('by_roomId', ['roomId']),

  gamePlayers: defineTable({
    userId: v.id('users'),
    loadoutId: v.id('loadouts'),
    gameId: v.id('games')
  })
    .index('by_user_id', ['userId'])
    .index('by_game_id', ['gameId']),

  gameReplays: defineTable({
    gameId: v.id('games'),
    replay: v.string(),
    initialState: v.string()
  }).index('by_game_id', ['gameId'])
};

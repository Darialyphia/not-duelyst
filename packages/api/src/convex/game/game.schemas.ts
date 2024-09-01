import { defineTable } from 'convex/server';
import { v, type Validator } from 'convex/values';
import { GAME_STATUS, type GameStatus } from './game.constants';
import type { GameSessionConfig } from '@game/sdk';

export const gameSchemas = {
  games: defineTable({
    seed: v.string(),
    status: v.union(
      v.literal(GAME_STATUS.CANCELLED),
      v.literal(GAME_STATUS.FINISHED),
      v.literal(GAME_STATUS.ONGOING),
      v.literal(GAME_STATUS.WAITING_FOR_PLAYERS)
    ) as Validator<GameStatus>,
    private: v.boolean(),
    roomId: v.string(),
    formatId: v.optional(v.id('formats')),
    lobbyId: v.optional(v.id('lobbies')),
    winnerId: v.optional(v.id('users')),
    cachedPlayers: v.array(
      v.object({
        id: v.id('users'),
        name: v.string(),
        isPlayer1: v.boolean(),
        deck: v.array(
          v.object({
            blueprintId: v.string(),
            pedestalId: v.string(),
            cardBackId: v.string()
          })
        )
      })
    ),
    cachedFormat: v.object({
      config: v.any() as Validator<GameSessionConfig>,
      cards: v.string(),
      map: v.string()
    })
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

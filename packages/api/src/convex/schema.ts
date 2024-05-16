import type { Faction } from '@game/sdk';
import { defineSchema, defineTable } from 'convex/server';
import { v, Validator } from 'convex/values';
import { GAME_STATUS, type GameStatus } from './game/game.constants';

export default defineSchema({
  users: defineTable({
    id: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    discriminator: v.optional(v.string()),
    mmr: v.number(),
    hasOnboarded: v.boolean()
  })
    .index('byId', ['id'])
    .index('by_fullname', ['name', 'discriminator'])
    .index('by_mmr', ['mmr']),

  sessions: defineTable({
    id: v.string(),
    user_id: v.string(),
    active_expires: v.float64(),
    idle_expires: v.float64()
  })
    .index('byId', ['id'])
    .index('byUserId', ['user_id']),

  auth_keys: defineTable({
    id: v.string(),
    hashed_password: v.union(v.string(), v.null()),
    user_id: v.string()
  })
    .index('byId', ['id'])
    .index('byUserId', ['user_id']),

  matchmaking: defineTable({
    nextInvocationId: v.optional(v.id('_scheduled_functions'))
  }),

  matchmakingUsers: defineTable({
    userId: v.id('users'),
    loadoutId: v.id('loadouts')
  }).index('by_userId', ['userId']),

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
    replay: v.string()
  }).index('by_game_id', ['gameId']),

  gameMaps: defineTable({
    name: v.string(),
    width: v.number(),
    height: v.number(),
    startPositions: v.array(
      v.object({
        x: v.number(),
        y: v.number(),
        z: v.number()
      })
    ),
    cells: v.string()
  }).index('by_name', ['name']),

  loadouts: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    cards: v.array(
      v.object({
        id: v.string(),
        pedestalId: v.string()
      })
    )
  }).index('by_owner_id', ['ownerId']),

  collectionItems: defineTable({
    itemId: v.string(),
    ownerId: v.id('users'),
    grantedAt: v.union(v.number(), v.null())
  })
    .index('by_owner_id', ['ownerId'])
    .index('by_item_id', ['itemId']),

  userSettings: defineTable({
    userId: v.id('users'),
    settings: v.any()
  }).index('by_user_id', ['userId']),

  featureFlags: defineTable({
    key: v.string(),
    value: v.boolean()
  })
});

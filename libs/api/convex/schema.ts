import { defineSchema, defineTable } from 'convex/server';
import { Validator, v } from 'convex/values';
import { GameStatus } from './game/game.constants';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    discriminator: v.string(),
    tokenIdentifier: v.string(),
    mmr: v.number()
  })
    .index('by_token', ['tokenIdentifier'])
    .index('by_fullname', ['name', 'discriminator'])
    .index('by_mmr', ['mmr']),

  matchmaking: defineTable({
    nextInvocationId: v.optional(v.id('_scheduled_functions'))
  }),

  matchmakingUsers: defineTable({
    userId: v.id('users'),
    loadoutId: v.id('loadouts')
  }).index('by_userId', ['userId']),

  games: defineTable({
    firstPlayer: v.id('users'),
    mapId: v.id('gameMaps'),
    status: v.string() as Validator<GameStatus>,
    roomId: v.string(),
    winnerId: v.optional(v.id('gamePlayers'))
  }).index('by_status', ['status']),

  gamePlayers: defineTable({
    userId: v.id('users'),
    loadoutId: v.id('loadouts'),
    gameId: v.id('games')
  })
    .index('by_user_id', ['userId'])
    .index('by_game_id', ['gameId']),

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
    cells: v.string(),
    interactables: v.array(
      v.object({
        position: v.object({
          x: v.number(),
          y: v.number(),
          z: v.number()
        }),
        id: v.string()
      })
    )
  }).index('by_name', ['name']),

  loadouts: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    generalId: v.string(),
    units: v.array(v.string())
  }).index('by_owner_id', ['ownerId']),

  collectionItems: defineTable({
    itemId: v.string(),
    ownerId: v.id('users')
  })
    .index('by_owner_id', ['ownerId'])
    .index('by_item_id', ['itemId'])
});

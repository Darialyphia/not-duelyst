import { v } from 'convex/values';
import { defineTable } from 'convex/server';
import { FACTIONS } from '@game/sdk';

export const gameStatsSchema = {
  gamesByFaction: v.object({
    [FACTIONS.F1.id]: v.object({ played: v.number(), won: v.number() }),
    [FACTIONS.F2.id]: v.object({ played: v.number(), won: v.number() }),
    [FACTIONS.F3.id]: v.object({ played: v.number(), won: v.number() }),
    [FACTIONS.F4.id]: v.object({ played: v.number(), won: v.number() }),
    [FACTIONS.F5.id]: v.object({ played: v.number(), won: v.number() }),
    [FACTIONS.F6.id]: v.object({ played: v.number(), won: v.number() })
  }),
  gamesByCard: v.any(),
  totalGames: v.number(),
  averageGameDuration: v.number()
};

export const analyticsSchemas = {
  globalStats: defineTable({
    ...gameStatsSchema,
    users: v.object({
      count: v.number(),
      skippedTutorial: v.number()
    })
  })
};

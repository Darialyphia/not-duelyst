import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const gameMapSchemas = {
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
  }).index('by_name', ['name'])
};

import { v } from 'convex/values';
import { mutation } from '../../_generated/server';

export const saveGameMapUsecase = mutation({
  args: {
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
  },
  handler: async ({ db }, mapData) => {
    const map = await db
      .query('gameMaps')
      .withIndex('by_name', q => q.eq('name', mapData.name))
      .unique();

    if (!map) {
      return db.insert('gameMaps', mapData);
    } else {
      return db.patch(map._id, mapData);
    }
  }
});

import { query } from '../../_generated/server';
import { toGameMapDto } from '../gameMap.mapper';

export const getAllGameMapsUsecase = query(async ({ db }) => {
  const maps = await db.query('gameMaps').collect();

  return maps.map(toGameMapDto);
});

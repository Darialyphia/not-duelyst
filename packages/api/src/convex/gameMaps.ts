import { getGameMapUsecase } from './gameMap/usecases/getGameMap.usecase';
import { getAllGameMapsUsecase } from './gameMap/usecases/getAllGameMaps.usecase';
import { saveGameMapUsecase } from './gameMap/usecases/saveGameMap.usecase';

export const getById = getGameMapUsecase;
export const getAll = getAllGameMapsUsecase;
export const save = saveGameMapUsecase;

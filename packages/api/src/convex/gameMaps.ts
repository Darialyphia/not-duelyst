import { getGameMapUsecase } from './gameMap/usecases/get-game-map.usecase';
import { getAllGameMapsUsecase } from './gameMap/usecases/get-all-game-maps.usecase';
import { saveGameMapUsecase } from './gameMap/usecases/save-game-map.usecase';

export const getById = getGameMapUsecase;
export const getAll = getAllGameMapsUsecase;
export const save = saveGameMapUsecase;

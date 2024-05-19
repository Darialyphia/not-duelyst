import { createLoadoutUsecase } from './loadout/usecases/create-loadout.usecase';
import { updateLoadoutUsecase } from './loadout/usecases/update-loadout.usecase';
import { deleteLoadoutUsecase } from './loadout/usecases/delete-loadout.usecase';
import { getMyLoadoutsUsecase } from './loadout/usecases/get-my-loadouts.usecase';
import { getLoadoutUsecase } from './loadout/usecases/get-loadout.usecase';

export const create = createLoadoutUsecase;
export const update = updateLoadoutUsecase;
export const remove = deleteLoadoutUsecase;
export const myLoadouts = getMyLoadoutsUsecase;
export const getById = getLoadoutUsecase;

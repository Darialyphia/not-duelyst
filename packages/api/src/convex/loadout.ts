import { createLoadoutUsecase } from './loadout/usecases/createLoadout.usecase';
import { updateLoadoutUsecase } from './loadout/usecases/update-loadout.usecase';
import { deleteLoadoutUsecase } from './loadout/usecases/deleteLoadout.usecase';
import { getMyLoadoutsUsecase } from './loadout/usecases/getMyLoadouts.usecase';
import { getLoadoutUsecase } from './loadout/usecases/getLoadout.usecase';

export const create = createLoadoutUsecase;
export const update = updateLoadoutUsecase;
export const remove = deleteLoadoutUsecase;
export const myLoadouts = getMyLoadoutsUsecase;
export const getById = getLoadoutUsecase;

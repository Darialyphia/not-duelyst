import { createFormatUsecase } from './formats/usecases/createFormat.usecase';
import { deleteFormatUsecase } from './formats/usecases/deleteFormat.usecase';
import { getAllFormatsUseCase } from './formats/usecases/getAllFormats.usecase';
import { getFormatByIdUseCase } from './formats/usecases/getFormatById.usecase';
import { getMyFormatsUseCase } from './formats/usecases/getMyFormats.usecase';
import { updateFormatUsecase } from './formats/usecases/updateFormat.usecase';

export const create = createFormatUsecase;
export const getMyFormats = getMyFormatsUseCase;
export const remove = deleteFormatUsecase;
export const update = updateFormatUsecase;
export const byId = getFormatByIdUseCase;
export const all = getAllFormatsUseCase;

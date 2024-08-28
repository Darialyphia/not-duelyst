import { createLobbyUsecase } from './lobby/usecases/createLobby.usecase';
import { deleteLobbyUsecase } from './lobby/usecases/deleteLobby.usecase';
import { getAllLobbiesUsecase } from './lobby/usecases/getAllLobbies.usecase';
import { joinLobbyUsecase } from './lobby/usecases/joinLobby.usecase';
import { leaveLobbyUsecase } from './lobby/usecases/leaveLobby.usecase';
import { selectLobbyFormatUsecase } from './lobby/usecases/selectLobbyFormat.usecase';
import { selectLobbyLoadoutUsecase } from './lobby/usecases/selectLobbyLoadout.usecase';

export const all = getAllLobbiesUsecase;
export const remove = deleteLobbyUsecase;
export const create = createLobbyUsecase;
export const join = joinLobbyUsecase;
export const leave = leaveLobbyUsecase;
export const chooseLoadout = selectLobbyLoadoutUsecase;
export const selectFormat = selectLobbyFormatUsecase;
export const changeRole = selectLobbyLoadoutUsecase;

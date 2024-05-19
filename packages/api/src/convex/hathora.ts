'use node';

import { getHathoraRoomIdUsecase } from './game/usecases/getHathoraRoomId.usecase';
import { destroyHathoraRoomUsecase } from './game/usecases/destroyHathoraRoom.usecase';

export const getRoomId = getHathoraRoomIdUsecase;
export const destroyRoom = destroyHathoraRoomUsecase;

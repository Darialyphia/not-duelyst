'use node';

import { getHathoraRoomIdUsecase } from './game/usecases/get-hathora-room-id.usecase';
import { destroyHathoraRoomUsecase } from './game/usecases/destroy-hathora-room.usecase';

export const getRoomId = getHathoraRoomIdUsecase;
export const destroyRoom = destroyHathoraRoomUsecase;

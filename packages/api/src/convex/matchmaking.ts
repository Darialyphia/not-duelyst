import { joinMatchmakingUsecase } from './matchmaking/usecases/joinMatchmaking.usecase';
import { leaveMatchmakingUsecase } from './matchmaking/usecases/leaveMatchmaking.usecase';
import { getMyMatchmakingUserUsecase } from './matchmaking/usecases/getMyMatchmakingUser.usecase';
import { matchPlayersUsecase } from './matchmaking/usecases/matchPlayers.usecase';
import { handleMatchmadePairUsecase } from './matchmaking/usecases/handleMatchmadePair.usecase';
import { getMatchmakingUsersUsecase } from './matchmaking/usecases/getMatchmakingUsers.usecase';
import { scheduleMatchmakingUsecase } from './matchmaking/usecases/scheduleMatchmaking.usecase';

export const join = joinMatchmakingUsecase;
export const leave = leaveMatchmakingUsecase;
export const myMatchmakingUser = getMyMatchmakingUserUsecase;
export const matchPlayers = matchPlayersUsecase;
export const handleMatchmadePair = handleMatchmadePairUsecase;
export const getMatchmakingUsers = getMatchmakingUsersUsecase;
export const setupNextInvocation = scheduleMatchmakingUsecase;

import { joinMatchmakingUsecase } from './matchmaking/usecases/join-matchmaking.usecase';
import { leaveMatchmakingUsecase } from './matchmaking/usecases/leave-matchmaking.usecase';
import { getMyMatchmakingUserUsecase } from './matchmaking/usecases/get-my-matchmaking-user.usecase';
import { matchPlayersUsecase } from './matchmaking/usecases/match-players.usecase';
import { handleMatchmadePairUsecase } from './matchmaking/usecases/handle-matchmade-pair.usecase';
import { getMatchmakingUsersUsecase } from './matchmaking/usecases/get-matchmaking-users.usecase';
import { scheduleMatchmakingUsecase } from './matchmaking/usecases/schedule-matchmaking.usecase';

export const join = joinMatchmakingUsecase;
export const leave = leaveMatchmakingUsecase;
export const myMatchmakingUser = getMyMatchmakingUserUsecase;
export const matchPlayers = matchPlayersUsecase;
export const handleMatchmadePair = handleMatchmadePairUsecase;
export const getMatchmakingUsers = getMatchmakingUsersUsecase;
export const setupNextInvocation = scheduleMatchmakingUsecase;

import { acceptFriendRequestUsecase } from './friend/usecases/acceptFriendRequest.usecase';
import { declineFriendRequestUsecase } from './friend/usecases/declineFriendRequest.usecase';
import { getFriendUsecase } from './friend/usecases/getFriends.usecase';
import { getReceivedFriendRequestsUsecase } from './friend/usecases/getReceivedFriendRequests.usecase';
import { markFriendRequestAsSeenUsecase } from './friend/usecases/markFriendRequestAsSeen.usecase';
import { sendFriendRequestUsecase } from './friend/usecases/sendFriendRequest';

export const sendFriendRequest = sendFriendRequestUsecase;
export const newRequests = getReceivedFriendRequestsUsecase;
export const markAsSeen = markFriendRequestAsSeenUsecase;
export const acceptFriendRequest = acceptFriendRequestUsecase;
export const declineFriendRequest = declineFriendRequestUsecase;
export const all = getFriendUsecase;

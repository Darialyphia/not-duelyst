import type { Id } from '../_generated/dataModel';
import type { User } from '../users/user.entity';
import { toUserDto, type UserDto } from '../users/user.mapper';
import type { FriendRequest } from './friendRequest.entity';

export type FriendRequestDto = {
  _id: Id<'friendRequests'>;
  _creationTime: number;
  sender: UserDto;
  receiver: UserDto;
  seen: boolean;
};

export const toFriendRequestDto = (
  friendRequest: FriendRequest & { sender: User; receiver: User }
): FriendRequestDto => {
  return {
    _id: friendRequest._id,
    _creationTime: friendRequest._creationTime,
    seen: friendRequest.seen,
    sender: toUserDto(friendRequest.sender),
    receiver: toUserDto(friendRequest.receiver)
  };
};

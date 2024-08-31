import { ONE_MINUTE_IN_MS } from '@game/shared';
import type { Id } from '../_generated/dataModel';
import type { User } from './user.entity';
import type { Lobby } from '../lobby/lobby.entity';

export type UserDto = {
  _id: Id<'users'>;
  _creationTime: number;
  name: string;
  slug: string;
  fullName: string;
  discriminator?: string;
  avatar: string;
  hasOnboarded: boolean;
  mmr: number;
  presence: 'offline' | 'online' | 'away';
};

const getPresence = (user: User): UserDto['presence'] => {
  if (!user.presenceLastUpdatedAt) return 'offline';

  if (Date.now() - user.presenceLastUpdatedAt > ONE_MINUTE_IN_MS * 5) {
    return 'offline';
  }
  if (Date.now() - user.presenceLastUpdatedAt > ONE_MINUTE_IN_MS * 2) {
    return 'away';
  }

  return user.presence;
};

export const toUserDto = (user: User): UserDto => {
  return {
    _id: user._id,
    _creationTime: user._creationTime,
    hasOnboarded: !!user.hasOnboarded,
    name: user.name ?? 'Anonymous',
    discriminator: user.discriminator,
    avatar: user.avatar,
    fullName: `${user.name}#${user.discriminator}`,
    mmr: user.mmr,
    slug: user.slug ?? '',
    presence: getPresence(user)
  };
};

export type MeDto = UserDto & { currentLobby?: Id<'lobbies'> };

export const toMeDto = (user: User & { lobby?: Lobby }): MeDto => {
  return {
    ...toUserDto(user),
    currentLobby: user.lobby?._id
  };
};

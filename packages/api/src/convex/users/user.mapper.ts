import { ONE_MINUTE_IN_MS } from '@game/shared';
import type { Id } from '../_generated/dataModel';
import type { User } from './user.entity';

export type UserDto = {
  _id: Id<'users'>;
  _creationTime: number;
  name: string;
  fullName: string;
  discriminator?: string;
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
    fullName: `${user.name}#${user.discriminator}`,
    mmr: user.mmr,
    presence: getPresence(user)
  };
};

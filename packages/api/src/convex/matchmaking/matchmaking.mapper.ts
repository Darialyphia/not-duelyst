import type { Id } from '../_generated/dataModel';
import type { MatchmakingUser } from './matchmaking.entity';

export type MatchmakingUserDto = {
  timeElapsed: number;
  loadoutId: Id<'loadouts'>;
};

export const toMatchmakingUserDto = (
  matchMakingUser: MatchmakingUser
): MatchmakingUserDto => {
  return {
    timeElapsed: Math.floor(
      (new Date().getTime() - matchMakingUser._creationTime) / 1000
    ),
    loadoutId: matchMakingUser.loadoutId
  };
};

import type { PartialBy } from '@game/shared';
import type { Id } from '../_generated/dataModel';
import type { GameFormat } from '../formats/format.entity';
import type { User } from '../users/user.entity';
import { toUserDto, type UserDto } from '../users/user.mapper';
import type { Lobby, LobbyUser } from './lobby.entity';

export type LobbyDto = {
  _id: Id<'lobbies'>;
  name: string;
  owner: UserDto;
  format: {
    _id?: Id<'formats'>;
    name: string;
  };
  usersCount: number;
};

export const toLobbyDto = (
  lobby: Lobby & {
    format: PartialBy<GameFormat, '_id' | '_creationTime'>;
    owner: User;
    users: LobbyUser[];
  }
): LobbyDto => {
  return {
    _id: lobby._id,
    name: lobby.name,
    format: {
      _id: lobby.format._id,
      name: lobby.format.name
    },
    owner: toUserDto(lobby.owner),
    usersCount: lobby.users.length
  };
};

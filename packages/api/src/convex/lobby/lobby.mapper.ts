import type { PartialBy } from '@game/shared';
import type { Id } from '../_generated/dataModel';
import type { GameFormat } from '../formats/format.entity';
import type { User } from '../users/user.entity';
import { toUserDto, type UserDto } from '../users/user.mapper';
import type { Lobby, LobbyUser } from './lobby.entity';
import type { LobbyStatus, LobbyUserRole } from './lobby.constants';
import type { Loadout } from '../loadout/loadout.entity';

export type LobbyDto = {
  _id: Id<'lobbies'>;
  name: string;
  owner: UserDto;
  needsPassword: boolean;
  gameId?: Id<'games'>;
  format: {
    _id?: Id<'formats'>;
    name: string;
  };
  usersCount: number;
  status: LobbyStatus;
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
    needsPassword: !!lobby.password,
    gameId: lobby.gameId,
    name: lobby.name,
    format: {
      _id: lobby.format._id,
      name: lobby.format.name
    },
    owner: toUserDto(lobby.owner),
    usersCount: lobby.users.length,
    status: lobby.status
  };
};

export type LobbyDetailsDto = Omit<LobbyDto, 'usersCount'> & {
  users: Array<
    UserDto & { loadout?: { _id: Id<'loadouts'>; name: string }; role: LobbyUserRole }
  >;
  messages: Array<{
    author: string;
    text: string;
  }>;
};

export const toLobbyDetailsDto = (
  lobby: Lobby & {
    format: PartialBy<GameFormat, '_id' | '_creationTime'>;
    owner: User;
    users: Array<LobbyUser & { user: User; loadout?: Loadout }>;
  }
): LobbyDetailsDto => {
  return {
    _id: lobby._id,
    name: lobby.name,
    needsPassword: !!lobby.password,
    gameId: lobby.gameId,
    status: lobby.status,
    format: {
      _id: lobby.format._id,
      name: lobby.format.name
    },
    owner: toUserDto(lobby.owner),
    messages: lobby.messages,
    users: lobby.users.map(u => ({
      ...toUserDto(u.user),
      loadout: u.loadout
        ? {
            _id: u.loadout._id,
            name: u.loadout.name
          }
        : undefined,
      role: u.role
    }))
  };
};

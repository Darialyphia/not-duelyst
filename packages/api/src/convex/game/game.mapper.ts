import type { Nullable } from '@game/shared';
import type { Id } from '../_generated/dataModel';
import type { GameStatus } from './game.constants';
import { toLoadoutDto, type LoadoutDto } from '../loadout/loadout.mapper';
import { toUserDto, type UserDto } from '../users/user.mapper';
import type { Game } from './game.entity';
import type { User } from '../users/user.entity';
import type { Loadout } from '../loadout/loadout.entity';

export type GameDto = {
  _id: Id<'games'>;
  startedAt: number;
  winnerId: Nullable<Id<'gamePlayers'>>;
  seed: string;
  firstPlayer: Id<'users'>;
  mapId: Id<'gameMaps'>;
  roomId: string;
  status: GameStatus;
  players: Array<
    UserDto & {
      loadout: LoadoutDto;
      gamePlayerId: Id<'gamePlayers'>;
    }
  >;
};

type GameMapperInput = Game & {
  players: Array<User & { loadout: Loadout; gamePlayerId: Id<'gamePlayers'> }>;
};
export const toGameDto = (game: GameMapperInput): GameDto => {
  return {
    _id: game._id,
    startedAt: game._creationTime,
    winnerId: game.winnerId,
    seed: game.seed,
    firstPlayer: game.firstPlayer,
    mapId: game.mapId,
    roomId: game.roomId,
    status: game.status,
    players: game.players.map(player => ({
      ...toUserDto(player),
      gamePlayerId: player.gamePlayerId,
      loadout: toLoadoutDto(player.loadout)
    }))
  };
};

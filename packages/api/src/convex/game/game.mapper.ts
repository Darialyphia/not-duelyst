import type { Nullable } from '@game/shared';
import type { Id } from '../_generated/dataModel';
import type { GameStatus } from './game.constants';
import { toGameLoadoutDto, type GameLoadoutDto } from '../loadout/loadout.mapper';
import { toUserDto, type UserDto } from '../users/user.mapper';
import type { Game } from './game.entity';
import type { User } from '../users/user.entity';
import type { Loadout } from '../loadout/loadout.entity';
import { type SimpleGameFormatDto } from '../formats/format.mapper';
import { parse } from 'zipson';

export type GameDto = {
  _id: Id<'games'>;
  startedAt: number;
  winnerId: Nullable<Id<'users'>>;
  roomId: string;
  seed: string;
  status: GameStatus;
  players: Array<
    UserDto & {
      loadout: GameLoadoutDto;
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
    roomId: game.roomId,
    status: game.status,
    seed: game.seed,
    players: game.players.map(player => ({
      ...toUserDto(player),
      gamePlayerId: player.gamePlayerId,
      loadout: toGameLoadoutDto(player.loadout)
    }))
  };
};

export type GameDetailsDto = {
  _id: Id<'games'>;
  startedAt: number;
  winnerId: Nullable<Id<'users'>>;
  seed: string;
  roomId: string;
  status: GameStatus;
  format: SimpleGameFormatDto;
  players: Array<{
    id: Id<'users'>;
    name: string;
    isPlayer1: boolean;
    deck: Array<{ blueprintId: string; pedestalId: string; cardBackId: string }>;
  }>;
};

type GameDetailsMapperInput = Game & {
  players: Array<User & { loadout: Loadout; gamePlayerId: Id<'gamePlayers'> }>;
};
export const toGameDetailsDto = (game: GameDetailsMapperInput): GameDetailsDto => {
  return {
    _id: game._id,
    startedAt: game._creationTime,
    winnerId: game.winnerId,
    seed: game.seed,
    roomId: game.roomId,
    status: game.status,
    format: {
      config: game.cachedFormat.config,
      cards: parse(game.cachedFormat.cards),
      map: parse(game.cachedFormat.map)
    },
    players: game.cachedPlayers
  };
};

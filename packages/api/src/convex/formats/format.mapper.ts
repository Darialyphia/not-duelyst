import type { Id } from '../_generated/dataModel';
import { toUserDto, type UserDto } from '../users/user.mapper';
import type { User } from '../users/user.entity';
import {
  defaultMap,
  type GameSessionConfig,
  type GenericSerializedBlueprint
} from '@game/sdk';
import type { GameFormat } from './format.entity';
import type { BoardSystemOptions } from '@game/sdk/src/board/board-system';
import { parse } from 'zipson';

export type GameFormatDto = {
  _id: Id<'formats'>;
  name: string;
  description: string;
  author: UserDto;
  config: GameSessionConfig;
  cards: Record<string, GenericSerializedBlueprint>;
  map: BoardSystemOptions;
};

export type GameFormatInput = GameFormat & { author: User };

export const toGameFormatDto = (format: GameFormatInput): GameFormatDto => {
  return {
    _id: format._id,
    name: format.name,
    description: format.description,
    config: format.config,
    cards: parse(format.cards),
    author: toUserDto(format.author),
    map: format.map ? parse(format.map) : defaultMap
  };
};

export type SimpleGameFormatDto = {
  config: GameSessionConfig;
  cards: Record<string, GenericSerializedBlueprint>;
  map: BoardSystemOptions;
};

export type SimpleGameFormatInput = Pick<GameFormat, keyof SimpleGameFormatDto>;

export const toSimpleGameFormatDto = (
  format: Pick<GameFormat, keyof SimpleGameFormatDto>
): SimpleGameFormatDto => {
  return {
    config: format.config,
    cards: parse(format.cards),
    map: format.map ? parse(format.map) : defaultMap
  };
};

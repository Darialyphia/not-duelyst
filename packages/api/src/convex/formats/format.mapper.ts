import type { Id } from '../_generated/dataModel';
import { toUserDto, type UserDto } from '../users/user.mapper';
import type { User } from '../users/user.entity';
import type { GameSessionConfig, GenericSerializedBlueprint } from '@game/sdk';
import { toGameMapDto, type GameMapDto } from '../gameMap/gameMap.mapper';
import type { GameFormat } from './format.entity';
import type { GameMap } from '../gameMap/gameMap.entity';

export type GameFormatDto = {
  _id: Id<'formats'>;
  name: string;
  description: string;
  author: UserDto;
  config: GameSessionConfig;
  cards: Record<string, GenericSerializedBlueprint>;
  map: GameMapDto;
};

export type GameFormatInput = GameFormat & { author: User; map: GameMap };

export const toGameFormatDto = (format: GameFormatInput): GameFormatDto => {
  return {
    _id: format._id,
    name: format.name,
    description: format.description,
    config: format.config,
    cards: JSON.parse(format.cards),
    author: toUserDto(format.author),
    map: toGameMapDto(format.map)
  };
};

export type SimpleGameFormatDto = {
  config: GameSessionConfig;
  cards: Record<string, GenericSerializedBlueprint>;
};

export type SimpleGameFormatInput = Pick<GameFormat, keyof SimpleGameFormatDto>;

export const toSimpleGameFormatDto = (
  format: Pick<GameFormat, keyof SimpleGameFormatDto>
): SimpleGameFormatDto => {
  return {
    config: format.config,
    cards: JSON.parse(format.cards)
  };
};

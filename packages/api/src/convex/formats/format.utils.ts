import { defaultConfig, type GenericSerializedBlueprint } from '@game/sdk';
import type { GameFormat } from './format.entity';

export const defaultFormat = {
  config: defaultConfig
} satisfies GameFormat;
import { defineTable } from 'convex/server';
import { v, type Validator } from 'convex/values';

export const gameMapSchemas = {
  formats: defineTable({
    author: v.id('users'),
    name: v.string(),
    description: v.string(),
    config: v.object({
      MAX_COPIES_PER_CARD: v.number(),
      MAX_DECK_SIZE: v.number(),
      MAX_HAND_SIZE: v.number(),
      MAX_GOLD: v.number(),
      GOLD_PER_TURN: v.number(),
      REFILL_GOLD_EVERY_TURN: v.boolean(),
      MAX_GOLD_INCREASE_PER_TURN: v.number(),
      PLAYER_1_STARTING_GOLD: v.number(),
      PLAYER_2_STARTING_GOLD: v.number(),
      UNIT_DEFAULT_SPEED: v.number(),
      STARTING_HAND_SIZE: v.number(),
      CARD_DRAW_PER_TURN: v.number(),
      MAX_REPLACES_PER_TURN: v.number(),
      UNLIMITED_RETALIATION: v.boolean(),
      CAN_WALK_THROUGH_ALLIES: v.boolean(),
      CAN_MOVE_AFTER_ATTACK: v.boolean(),
      ARTIFACT_DURABILITY: v.number(),
      DRAW_AT_END_OF_TURN: v.boolean()
    }),
    cardOverrides: v.any() as Validator<Record<string, GenericSerializedBlueprint>>,
    map: v.id('gameMaps')
  }).index('by_name', ['name'])
};

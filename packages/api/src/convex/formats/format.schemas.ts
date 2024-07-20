import { defaultConfig, type GenericSerializedBlueprint } from '@game/sdk';
import type { GameFormat } from './format.entity';

export const defaultFormat = {
  config: defaultConfig
} satisfies GameFormat;
import { defineTable } from 'convex/server';
import { v, type Validator } from 'convex/values';
import { formatConfigValidator } from './format.utils';

export const formatSchemas = {
  formats: defineTable({
    author: v.id('users'),
    name: v.string(),
    description: v.string(),
    config: formatConfigValidator,
    cards: v.any() as Validator<Record<string, GenericSerializedBlueprint>>,
    map: v.id('gameMaps')
  }).index('by_name', ['name'])
};

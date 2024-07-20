import { type GenericSerializedBlueprint } from '@game/sdk';

import { defineTable } from 'convex/server';
import { v, type Validator } from 'convex/values';
import { formatConfigValidator } from './format.utils';

export const formatSchemas = {
  formats: defineTable({
    name: v.string(),
    description: v.string(),
    config: formatConfigValidator,
    cards: v.any() as Validator<Record<string, GenericSerializedBlueprint>>,
    authorId: v.id('users'),
    mapId: v.id('gameMaps')
  })
    .index('by_name', ['name'])
    .index('by_authorId', ['authorId'])
};

import { defaultConfig, defaultMap } from '@game/sdk';
import type { GameFormat } from './format.entity';
import { v } from 'convex/values';
import type { Doc, Id } from '../_generated/dataModel';
import { asyncMap } from 'convex-helpers';
import { getManyFrom, getOneFromOrThrow } from 'convex-helpers/server/relationships';
import type { QueryCtx } from '../_generated/server';
import { stringify } from 'zipson';
import type { RequiredBy } from '@game/shared';

export const defaultFormat: RequiredBy<
  Omit<GameFormat, '_id' | '_creationTime'>,
  'map'
> = {
  name: 'Standard',
  description: 'The standard Darialyst format.',
  authorId: '_system' as Id<'users'>,
  config: defaultConfig,
  cards: stringify({}),
  map: stringify(defaultMap)
};

export const formatConfigValidator = v.object({
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
  PLAYER_1_STARTING_HAND_SIZE: v.number(),
  PLAYER_2_STARTING_HAND_SIZE: v.number(),
  CARD_DRAW_PER_TURN: v.number(),
  MAX_REPLACES_PER_TURN: v.number(),
  UNLIMITED_RETALIATION: v.boolean(),
  CAN_WALK_THROUGH_ALLIES: v.boolean(),
  CAN_MOVE_AFTER_ATTACK: v.boolean(),
  ARTIFACT_DURABILITY: v.number(),
  DRAW_AT_END_OF_TURN: v.boolean()
});

export const getFormatWithAuthor = async (db: QueryCtx['db'], format: Doc<'formats'>) => {
  const author = await getOneFromOrThrow(db, 'users', 'by_id', format.authorId, '_id');
  return { ...format, author };
};

export const getFormatsByAuthor = async (db: QueryCtx['db'], authorId: Id<'users'>) => {
  return asyncMap(
    await getManyFrom(db, 'formats', 'by_authorId', authorId),
    async format => getFormatWithAuthor(db, format)
  );
};

export const ensureFormatExists = async (
  { db }: { db: QueryCtx['db'] },
  formatId?: Id<'formats'>
) => {
  if (!formatId) return defaultFormat;
  const format = await db.get(formatId);
  if (!format) throw new Error(`Format not found: ${formatId}`);

  return format;
};

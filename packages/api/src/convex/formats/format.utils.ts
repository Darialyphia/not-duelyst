import { defaultConfig } from '@game/sdk';
import type { GameFormat } from './format.entity';
import { v } from 'convex/values';
import type { Doc, Id } from '../_generated/dataModel';
import { asyncMap } from 'convex-helpers';
import { getManyFrom, getOneFromOrThrow } from 'convex-helpers/server/relationships';
import type { QueryCtx } from '../_generated/server';

export const DEFAULT_MAP_ID = 'jn77k33k3z5zdajcwhnjee2e7d6x928n' as Id<'gameMaps'>;

export const defaultFormat = {
  name: 'Standard',
  description: 'The standard Darialyst format.',
  authorId: '_system' as Id<'users'>,
  config: defaultConfig,
  cards: '{}',
  mapId: DEFAULT_MAP_ID
} satisfies Omit<GameFormat, '_id' | '_creationTime'>;

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

export const getFormatWithMapAndAuthor = async (
  db: QueryCtx['db'],
  format: Doc<'formats'>
) => {
  const map = await getOneFromOrThrow(db, 'gameMaps', 'by_id', format.mapId, '_id');
  const author = await getOneFromOrThrow(db, 'users', 'by_id', format.authorId, '_id');
  return { ...format, map, author };
};

export const getFormatsByAuthor = async (db: QueryCtx['db'], authorId: Id<'users'>) => {
  return asyncMap(
    await getManyFrom(db, 'formats', 'by_authorId', authorId),
    async format => getFormatWithMapAndAuthor(db, format)
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

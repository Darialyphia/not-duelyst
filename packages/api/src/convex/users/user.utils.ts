import type { QueryCtx } from '../_generated/server';
import type { Nullable, Values } from '@game/shared';
import type { User } from './user.entity';

// ELO stuff
export const DEFAULT_MMR = 1200;

export const GAME_RESULTS = {
  LOSS: 0,
  DRAW: 0.5,
  WIN: 1
} as const;
export type GameResult = Values<typeof GAME_RESULTS>;

export const computeNewMMR = (mmr: number, opponentMmr: number, status: GameResult) => {
  const K = 32;
  const delta = (score: number, opponentMmr: number, status: GameResult) => {
    const probability = 1 / (1 + Math.pow(10, (opponentMmr - score) / 400));
    return Math.round(K * (status - probability));
  };
  return mmr + delta(mmr, opponentMmr, status);
};

// username discriminator stuff
const MAX_DISCRIMINATOR_VALUE = 9999;

const generateRandomDiscriminator = () => {
  const num = Math.round(Math.random() * MAX_DISCRIMINATOR_VALUE);

  return String(num).padStart(4, '0');
};

export const generateDiscriminator = async (
  { db }: Pick<QueryCtx, 'db'>,
  name: string
) => {
  let discriminator = generateRandomDiscriminator();
  let existingUser: Nullable<User>;

  do {
    existingUser = await db
      .query('users')
      .withIndex('by_fullname', q =>
        q.eq('name', name).eq('discriminator', discriminator)
      )
      .unique();
    if (existingUser) {
      discriminator = generateRandomDiscriminator();
    }
  } while (existingUser != null);

  return discriminator;
};

export const slugify = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const ensureUserByEmail = async (
  { db }: { db: QueryCtx['db'] },
  email: string
) => {
  const user = await db
    .query('users')
    .withIndex('by_email', q => q.eq('email', email))
    .unique();

  if (!user) throw new Error('user not found');

  return user;
};

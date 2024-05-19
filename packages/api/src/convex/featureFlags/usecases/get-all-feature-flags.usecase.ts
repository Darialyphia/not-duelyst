import { query } from '../../_generated/server';
import type { FeatureFlag } from '../featureFlags.constants';

export const getAllFeatureFlagsUsecase = query(async ({ db }) => {
  const flags = await db.query('featureFlags').collect();

  return Object.fromEntries(flags.map(flag => [flag.key, flag.value])) as Record<
    FeatureFlag,
    boolean
  >;
});

import type { QueryCtx } from '../_generated/server';

export const ensureAuthenticated = async ({ auth }: { auth: QueryCtx['auth'] }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) throw new Error(`Unauthorized`);

  return identity;
};

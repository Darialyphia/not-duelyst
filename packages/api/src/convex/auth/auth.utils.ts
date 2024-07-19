import { ConvexError, type ObjectType, type PropertyValidators, v } from 'convex/values';
import { customQuery, customMutation } from 'convex-helpers/server/customFunctions';
import { LuciaError, type Session, type User } from 'lucia';
import {
  type DatabaseWriter,
  type MutationCtx,
  type QueryCtx,
  internalMutation,
  internalQuery,
  mutation,
  query
} from '../_generated/server';
import { type Auth, getAuth } from './lucia.adapter';
import { type Nullable } from '@game/shared';
import { match } from 'ts-pattern';

export type QueryWithAuthCtx = QueryCtx & { session: Nullable<Session> };

export const queryWithAuth = customQuery(query, {
  args: {
    sessionId: v.union(v.null(), v.string())
  },
  input: async (ctx, args: any) => {
    try {
      const session = await getValidExistingSession(ctx, args.sessionId);
      return { ctx: { ...ctx, session }, args: {} };
    } catch (err) {
      if (err instanceof LuciaError) {
        match(err.message)
          .with('AUTH_INVALID_SESSION_ID', 'AUTH_INVALID_USER_ID', () => {
            throw new ConvexError({ code: 'INVALID_SESSION' });
          })
          .otherwise(() => {
            throw err;
          });
      }
      throw err;
    }
  }
});

export const internalQueryWithAuth = customQuery(internalQuery, {
  args: {
    sessionId: v.union(v.null(), v.string())
  },
  input: async (ctx, args: any) => {
    try {
      const session = await getValidExistingSession(ctx, args.sessionId);
      return { ctx: { ...ctx, session }, args: {} };
    } catch (err) {
      if (err instanceof LuciaError) {
        match(err.message)
          .with('AUTH_INVALID_SESSION_ID', 'AUTH_INVALID_USER_ID', () => {
            throw new ConvexError({ code: 'INVALID_SESSION' });
          })
          .otherwise(() => {
            throw err;
          });
      }
      throw err;
    }
  }
});

export const mutationWithAuth = customMutation(mutation, {
  args: { sessionId: v.union(v.null(), v.string()) },
  input: async (ctx, args) => {
    try {
      const auth = getAuth(ctx.db);
      const session = await getValidSessionAndRenew(auth, args.sessionId);
      return { ctx: { session, auth }, args: {} };
    } catch (err) {
      if (err instanceof LuciaError) {
        console.log(err);

        match(err.message)
          .with('AUTH_INVALID_SESSION_ID', 'AUTH_INVALID_USER_ID', () => {
            throw new ConvexError({ code: 'INVALID_SESSION' });
          })
          .otherwise(() => {
            throw err;
          });
      }
      throw err;
    }
  }
});

export const internalMutationWithAuth = customMutation(internalMutation, {
  args: { sessionId: v.union(v.null(), v.string()) },
  input: async (ctx, args) => {
    try {
      const auth = getAuth(ctx.db);
      const session = await getValidSessionAndRenew(auth, args.sessionId);
      return { ctx: { session, auth }, args: {} };
    } catch (err) {
      if (err instanceof LuciaError) {
        console.log(err);

        match(err.message)
          .with('AUTH_INVALID_SESSION_ID', 'AUTH_INVALID_USER_ID', () => {
            throw new ConvexError({ code: 'INVALID_SESSION' });
          })
          .otherwise(() => {
            throw err;
          });
      }
      throw err;
    }
  }
});

async function getValidExistingSession(ctx: QueryCtx, sessionId: string | null) {
  if (sessionId === null) {
    return null;
  }
  // The cast is OK because we will only expose the existing session
  const auth = getAuth(ctx.db as DatabaseWriter);
  const session = (await auth.getSession(sessionId)) as Session | null;

  if (session === null || session.state !== 'active') {
    return null;
  }

  return session;
}

async function getValidSessionAndRenew(auth: Auth, sessionId: string | null) {
  if (sessionId === null) {
    return null;
  }
  return await auth.validateSession(sessionId);
}

export const ensureAuthenticated = (session: Nullable<Session>) => {
  if (!session) throw new Error(`Unauthorized`);

  return session;
};

export const authedQuery = customQuery(query, {
  args: {
    sessionId: v.union(v.null(), v.string())
  },
  input: async (ctx, args: any) => {
    try {
      const session = ensureAuthenticated(
        await getValidExistingSession(ctx, args.sessionId)
      );

      return { ctx: { ...ctx, session, user: session.user }, args: {} };
    } catch (err) {
      if (err instanceof LuciaError) {
        match(err.message)
          .with('AUTH_INVALID_SESSION_ID', 'AUTH_INVALID_USER_ID', () => {
            throw new ConvexError({ code: 'INVALID_SESSION' });
          })
          .otherwise(() => {
            throw err;
          });
      }
      throw err;
    }
  }
});

export const internalAuthedQuery = customQuery(query, {
  args: {
    sessionId: v.union(v.null(), v.string())
  },
  input: async (ctx, args: any) => {
    try {
      const session = ensureAuthenticated(
        await getValidExistingSession(ctx, args.sessionId)
      );
      return { ctx: { ...ctx, session, user: session.user }, args: {} };
    } catch (err) {
      if (err instanceof LuciaError) {
        match(err.message)
          .with('AUTH_INVALID_SESSION_ID', 'AUTH_INVALID_USER_ID', () => {
            throw new ConvexError({ code: 'INVALID_SESSION' });
          })
          .otherwise(() => {
            throw err;
          });
      }
      throw err;
    }
  }
});
export const authedMutation = customMutation(mutation, {
  args: { sessionId: v.union(v.null(), v.string()) },
  input: async (ctx, args) => {
    try {
      const auth = getAuth(ctx.db);
      const session = ensureAuthenticated(
        await getValidExistingSession(ctx, args.sessionId)
      );
      return { ctx: { session, auth, user: session.user }, args: {} };
    } catch (err) {
      if (err instanceof LuciaError) {
        console.log(err);

        match(err.message)
          .with('AUTH_INVALID_SESSION_ID', 'AUTH_INVALID_USER_ID', () => {
            throw new ConvexError({ code: 'INVALID_SESSION' });
          })
          .otherwise(() => {
            throw err;
          });
      }
      throw err;
    }
  }
});

export const internalAuthedMutation = customMutation(internalMutation, {
  args: { sessionId: v.union(v.null(), v.string()) },
  input: async (ctx, args) => {
    try {
      const auth = getAuth(ctx.db);
      const session = ensureAuthenticated(
        await getValidExistingSession(ctx, args.sessionId)
      );
      return { ctx: { session, auth, user: session.user }, args: {} };
    } catch (err) {
      if (err instanceof LuciaError) {
        console.log(err);

        match(err.message)
          .with('AUTH_INVALID_SESSION_ID', 'AUTH_INVALID_USER_ID', () => {
            throw new ConvexError({ code: 'INVALID_SESSION' });
          })
          .otherwise(() => {
            throw err;
          });
      }
      throw err;
    }
  }
});

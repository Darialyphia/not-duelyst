import { ConvexError, type ObjectType, type PropertyValidators, v } from 'convex/values';
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

export function queryWithAuth<ArgsValidator extends PropertyValidators, Output>({
  args,
  handler
}: {
  args: ArgsValidator;
  handler: (
    ctx: Omit<QueryCtx, 'auth'> & { session: Session | null },
    args: ObjectType<ArgsValidator>
  ) => Output;
}) {
  return query({
    args: {
      ...args,
      sessionId: v.union(v.null(), v.string())
    },
    handler: async (ctx, args: any) => {
      try {
        const session = await getValidExistingSession(ctx, args.sessionId);
        return await handler({ ...ctx, session }, args);
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
}

export function internalQueryWithAuth<ArgsValidator extends PropertyValidators, Output>({
  args,
  handler
}: {
  args: ArgsValidator;
  handler: (
    ctx: Omit<QueryCtx, 'auth'> & { session: Session | null },
    args: ObjectType<ArgsValidator>
  ) => Output;
}) {
  return internalQuery({
    args: { ...args, sessionId: v.union(v.null(), v.string()) },
    handler: async (ctx, args: any) => {
      try {
        const session = await getValidExistingSession(ctx, args.sessionId);
        return await handler({ ...ctx, session }, args);
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
}

export function mutationWithAuth<ArgsValidator extends PropertyValidators, Output>({
  args,
  handler
}: {
  args: ArgsValidator;
  handler: (
    ctx: Omit<MutationCtx, 'auth'> & { auth: Auth; session: Session | null },
    args: ObjectType<ArgsValidator>
  ) => Output;
}) {
  return mutation({
    args: { ...args, sessionId: v.union(v.null(), v.string()) },
    handler: async (ctx, args: any) => {
      try {
        const auth = getAuth(ctx.db);
        const { sessionId, ...otherArgs } = args;
        const session = await getValidSessionAndRenew(auth, sessionId);
        return await handler({ ...ctx, session, auth }, otherArgs);
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
}

export function internalMutationWithAuth<
  ArgsValidator extends PropertyValidators,
  Output
>({
  args,
  handler
}: {
  args: ArgsValidator;
  handler: (
    ctx: Omit<MutationCtx, 'auth'> & { auth: Auth; session: Session | null },
    args: ObjectType<ArgsValidator>
  ) => Output;
}) {
  return internalMutation({
    args: { ...args, sessionId: v.union(v.null(), v.string()) },
    handler: async (ctx, args: any) => {
      const auth = getAuth(ctx.db);
      const session = await getValidSessionAndRenew(auth, args.sessionId);
      return handler({ ...ctx, session, auth }, args);
    }
  });
}

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

export const ensureAuthenticated = (session: Nullable<Session>): User => {
  if (!session) throw new Error(`Unauthorized`);

  return session.user;
};

export const authedQuery = <ArgsValidator extends PropertyValidators, Output>({
  args,
  handler
}: {
  args: ArgsValidator;
  handler: (
    ctx: Omit<QueryCtx, 'auth'> & { session: Session; user: User },
    args: ObjectType<ArgsValidator>
  ) => Output;
}) => {
  return queryWithAuth({
    args,
    async handler(ctx, args) {
      const user = ensureAuthenticated(ctx.session);

      return handler({ ...ctx, session: ctx.session!, user }, args);
    }
  });
};

export const internalAuthedQuery = <ArgsValidator extends PropertyValidators, Output>({
  args,
  handler
}: {
  args: ArgsValidator;
  handler: (
    ctx: Omit<QueryCtx, 'auth'> & { session: Session; user: User },
    args: ObjectType<ArgsValidator>
  ) => Output;
}) => {
  return internalQueryWithAuth({
    args,
    async handler(ctx, args) {
      const user = ensureAuthenticated(ctx.session);

      return handler({ ...ctx, session: ctx.session!, user }, args);
    }
  });
};

export const authedMutation = <ArgsValidator extends PropertyValidators, Output>({
  args,
  handler
}: {
  args: ArgsValidator;
  handler: (
    ctx: Omit<MutationCtx, 'auth'> & { session: Session; user: User },
    args: ObjectType<ArgsValidator>
  ) => Output;
}) => {
  return mutationWithAuth({
    args,
    async handler(ctx, args) {
      const user = ensureAuthenticated(ctx.session);

      return handler({ ...ctx, session: ctx.session!, user }, args);
    }
  });
};

export const internalAuthedMutation = <ArgsValidator extends PropertyValidators, Output>({
  args,
  handler
}: {
  args: ArgsValidator;
  handler: (
    ctx: Omit<MutationCtx, 'auth'> & { session: Session; user: User },
    args: ObjectType<ArgsValidator>
  ) => Output;
}) => {
  return internalMutationWithAuth({
    args,
    async handler(ctx, args) {
      const user = ensureAuthenticated(ctx.session);

      return handler({ ...ctx, session: ctx.session!, user }, args);
    }
  });
};

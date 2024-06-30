// lucia.ts
import {
  type DatabaseSession,
  type Adapter,
  Lucia,
  TimeSpan,
  type DatabaseUser
} from 'lucia';
import type { DatabaseReader, DatabaseWriter } from '../_generated/server';

type SessionId = string;

declare module 'lucia' {
  interface Register {
    Lucia: Auth;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseSessionAttributes {
  _id: import('../_generated/dataModel').Id<'sessions'>;
  _creationTime: number;
}
interface DatabaseUserAttributes {
  _id: import('../_generated/dataModel').Id<'users'>;
  _creationTime: number;
  email: string;
  name?: string;
  discriminator?: string;
  mmr: number;
  hasOnboarded: boolean;
  presence: 'offline' | 'online' | 'away';
}

export function getAuth(db: DatabaseWriter) {
  return new Lucia(convexAdapter(db), {
    sessionExpiresIn: new TimeSpan(30, 'd'),
    getUserAttributes(user) {
      return {
        _id: user._id,
        _creationTime: user._creationTime,
        email: user.email,
        name: user.name,
        mmr: user.mmr,
        presence: user.presence,
        discriminator: user.discriminator,
        hasOnboarded: user.hasOnboarded
      };
    }
  });
}

const convexAdapter = (db: DatabaseWriter) => {
  const adapter: Adapter = {
    async getSessionAndUser(sessionId: string) {
      const session = await getSession(db, sessionId);
      if (session === null) {
        return [null, null];
      }
      const user = await getUser(db, session.user_id);
      if (user === null) {
        return [null, null];
      }
      return [session, user] as [DatabaseSession, DatabaseUser];
    },
    async deleteSession(sessionId: SessionId): Promise<void> {
      const session = await getSession(db, sessionId);
      if (session === null) {
        return;
      }
      await db.delete(session._id);
    },
    async setSession(session): Promise<void> {
      await db.insert('sessions', {
        expires_at: session.expiresAt.getTime(),
        id: session.id,
        user_id: session.userId
      });
    },
    deleteExpiredSessions() {
      return Promise.resolve();
    },
    deleteUserSessions(userId) {
      return Promise.resolve();
    },
    getUserSessions(userId) {
      return db
        .query('sessions')
        .withIndex('byId', q => q.eq('id', userId))
        .collect() as unknown as Promise<Array<DatabaseSession>>;
    },
    updateSessionExpiration(sessionId, expiresAt) {
      return Promise.resolve();
    }
  };

  return adapter;
};

async function getSession(db: DatabaseReader, sessionId: string) {
  return await db
    .query('sessions')
    .withIndex('byId', q => q.eq('id', sessionId))
    .first();
}

async function getUser(db: DatabaseReader, userId: string) {
  return await db
    .query('users')
    .withIndex('byId', q => q.eq('id', userId))
    .first();
}

async function getKey(db: DatabaseReader, keyId: string) {
  return await db
    .query('auth_keys')
    .withIndex('byId', q => q.eq('id', keyId))
    .first();
}

export type Auth = ReturnType<typeof getAuth>;

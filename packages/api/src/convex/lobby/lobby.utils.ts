import type { Id } from '../_generated/dataModel';
import type { QueryCtx } from '../_generated/server';

export const getCurrentLobby = async (
  { db }: { db: QueryCtx['db'] },
  userId: Id<'users'>
) => {
  const currentLobbyUser = await db
    .query('lobbyUsers')
    .filter(q => q.eq(q.field('userId'), userId))
    .unique();

  if (!currentLobbyUser) return null;

  return db.get(currentLobbyUser.lobbyId);
};

export const ensureHasNoCurrentLobby = async (
  { db }: { db: QueryCtx['db'] },
  userId: Id<'users'>
) => {
  const lobby = await getCurrentLobby({ db }, userId);
  if (!lobby) return;
  throw new Error('Already in a lobby !');
};

export const ensureLobbyExists = async (
  { db }: { db: QueryCtx['db'] },
  lobbyId: Id<'lobbies'>
) => {
  const lobby = await db.get(lobbyId);
  if (!lobby) throw new Error('Lobby not found');
  return lobby;
};

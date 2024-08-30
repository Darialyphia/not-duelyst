import { api } from '@game/api';
import type { GameServer, GameSocket } from './types';
import { Game } from './game';
import type { Id } from '@game/api/src/convex/_generated/dataModel';

export const handleSpectatorSocket = async (
  io: GameServer,
  socket: GameSocket,
  ongoingGames: Map<string, Game>,
  gameId: Id<'games'>
) => {
  try {
    const game = await socket.data.convexClient.query(api.games.byId, {
      gameId
    });
    if (!game) {
      return socket.disconnect();
    }

    if (!ongoingGames.has(game._id)) {
      socket.disconnect();
    }

    const gameSession = ongoingGames.get(game._id)!;
    gameSession.spectate(socket);
  } catch (err) {
    console.error(err);
  }
};

import { UserDto, api } from '@hc/api';
import { Server, Socket } from 'socket.io';
import { ConvexHttpClient } from 'convex/browser';
import { GameSession } from '@hc/sdk';
// eslint-disable-next-line import/no-unresolved
import { Id } from '@hc/api/convex/_generated/dataModel';

export const handleSpectatorSocket = async (
  io: Server<
    any,
    any,
    Record<string, never>,
    {
      convexClient: ConvexHttpClient;
      user: UserDto;
    }
  >,
  socket: Socket<
    any,
    any,
    Record<string, never>,
    {
      convexClient: ConvexHttpClient;
      user: UserDto;
    }
  >,
  ongoingGames: Map<string, { session: GameSession; playerJoined: Set<string> }>,
  gameId: Id<'games'>
) => {
  const game = await socket.data.convexClient.query(api.games.getById, {
    gameId
  });
  if (!game) {
    return socket.disconnect();
  }

  const map = await socket.data.convexClient.query(api.gameMaps.getById, {
    mapId: game.mapId
  });
  if (!map) {
    return socket.disconnect();
  }

  if (!ongoingGames.has(game._id)) {
    socket.disconnect();
  }

  const { session } = ongoingGames.get(game._id)!;

  socket.join(game._id);
  socket.emit('game:init', session.serialize());
};

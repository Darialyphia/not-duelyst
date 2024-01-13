import { api } from '@hc/api';
import { stringify } from 'zipson';
import { GameServer, GameSocket } from './types';
import { Game } from './game';

export const handlePlayerSocket = async (
  io: GameServer,
  socket: GameSocket,
  ongoingGames: Map<string, Game>
) => {
  const game = await socket.data.convexClient.query(api.games.getCurrent);
  if (!game) {
    console.log('Game not found');
    return socket.disconnect();
  }
  const map = await socket.data.convexClient.query(api.gameMaps.getById, {
    mapId: game.mapId
  });
  if (!map) {
    console.log('Map not found');
    return socket.disconnect();
  }

  if (!ongoingGames.has(game._id)) {
    ongoingGames.set(game._id, new Game(io, socket.data.convexClient, game, map));
  }

  const gameSession = ongoingGames.get(game._id)!;
  gameSession.join(socket);
};

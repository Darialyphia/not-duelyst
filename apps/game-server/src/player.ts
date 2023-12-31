import { UserDto, api } from '@hc/api';
import { Server, Socket } from 'socket.io';
import { ConvexHttpClient } from 'convex/browser';
import { GameSession } from '@hc/sdk';
import { parse } from 'zipson';

export const handlePlayerSocket = async (
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
  ongoingGames: Map<string, { session: GameSession; playerJoined: Set<string> }>
) => {
  const game = await socket.data.convexClient.query(api.games.getCurrent);
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
    const session = GameSession.createServerSession({
      activePlayerId: game.firstPlayer,
      history: [],
      entities: [],
      turn: 0,
      players: [
        {
          gold: 2,
          id: game.players[0]._id,
          name: game.players[0].name,
          loadout: {
            units: Object.fromEntries(
              game.players[0].loadout!.units.map(unit => [unit, { cooldown: 0 }])
            )
          },
          generalId: game.players[0].loadout!.generalId
        },
        {
          gold: 2,
          id: game.players[1]._id,
          name: game.players[1].name,
          loadout: {
            units: Object.fromEntries(
              game.players[1].loadout!.units.map(unit => [unit, { cooldown: 0 }])
            )
          },
          generalId: game.players[1].loadout!.generalId
        }
      ],
      map: {
        ...map,
        cells: parse(map.cells),
        startPositions: [map.startPositions[0], map.startPositions[1]]
      }
    });
    session.subscribe(action => {
      io.in(game._id).emit('game:action', action.serialize());
      if (action.name !== 'END_GAME') return;
      const { winner } = session.getState();

      socket.data.convexClient.action(api.games.end, {
        gameId: game._id,
        winnerId: winner!.id as any
      });
    });

    ongoingGames.set(game._id, {
      session,
      playerJoined: new Set()
    });
  }

  const { session, playerJoined } = ongoingGames.get(game._id)!;

  socket.on(
    'game:input',
    ({ type, payload }: { gameId: string; type: any; payload: any }) => {
      session.dispatchPlayerInput({
        type: type,
        payload: { ...payload, playerId: socket.data.user._id }
      });
    }
  );

  socket.join(game._id);
  playerJoined.add(socket.data.user._id);

  if (playerJoined.size === 2) {
    io.in(game._id).emit('game:init', session.serialize());
    if (game.status === 'WAITING_FOR_PLAYERS') {
      socket.data.convexClient.mutation(api.games.start, { gameId: game._id });
    }
  }
};

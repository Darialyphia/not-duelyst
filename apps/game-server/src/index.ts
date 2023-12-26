import { GameSession } from '@hc/sdk';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { api } from '@hc/api';
import { ConvexHttpClient } from 'convex/browser';
import { UserDto } from '@hc/api/convex/users/user.mapper';
import { parse } from 'zipson';

const PORT = process.env.PORT || 8000;

async function main() {
  const ongoingGames = new Map<
    string,
    { session: GameSession; playerJoined: Set<string> }
  >();
  const httpServer = createServer();
  const io = new Server<
    any, // @FIXME
    any, // @FIXME
    Record<string, never>,
    {
      convexClient: ConvexHttpClient;
      user: UserDto;
    }
  >(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  httpServer.listen(PORT);

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    const client = new ConvexHttpClient(process.env.CONVEX_URL!);

    client.setAuth(token);
    const user = await client.query(api.users.me);
    if (!user) return next(new Error('Unauthorized'));

    socket.data.convexClient = client;
    socket.data.user = user;
    next();
  });

  io.on('connection', async socket => {
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
              units: {
                'haven-melee': { cooldown: 0 },
                'haven-archer': { cooldown: 0 },
                'haven-tank': { cooldown: 0 },
                'haven-caster': { cooldown: 0 }
              }
            },
            generalId: 'haven-hero'
          },
          {
            gold: 2,
            id: game.players[1]._id,
            name: game.players[1].name,
            loadout: {
              units: {
                'haven-melee': { cooldown: 0 },
                'haven-archer': { cooldown: 0 },
                'haven-tank': { cooldown: 0 },
                'haven-caster': { cooldown: 0 }
              }
            },
            generalId: 'haven-hero'
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
  });

  console.log(`Server running on port ${PORT}`);
}

main();

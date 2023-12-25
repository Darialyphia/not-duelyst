import { GameSession } from '@hc/sdk';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { api } from '@hc/api';
import { ConvexHttpClient } from 'convex/browser';
import { UserDto } from '@hc/api/convex/users/user.mapper';

const PORT = process.env.PORT || 8000;

async function main() {
  const ongoingGames = new Map<
    string,
    { session: GameSession; playerJoined: Set<string> }
  >();
  const httpServer = createServer();
  const io = new Server<
    any,
    any,
    any,
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
    console.log('socket connected');
    const game = await socket.data.convexClient.query(api.games.getCurrent);
    if (!game) {
      console.log('game not found');
      return socket.disconnect();
    }
    const map = await socket.data.convexClient.query(api.gameMaps.getById, {
      mapId: game.mapId
    });
    if (!map) {
      console.log('map not found');
      return socket.disconnect();
    }

    if (!ongoingGames.has(game._id)) {
      console.log('creating game session');
      const session = GameSession.createServerSession({
        activePlayerId: game.firstPlayer,
        history: [],
        entities: [],
        turn: 0,
        players: [
          {
            gold: 2,
            id: game.players[0]._id,
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
          startPositions: [map.startPositions[0], map.startPositions[1]]
        }
      });
      session.subscribe(action => {
        io.in(game._id).emit('game:action', action.serialize());
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
    }
  });

  console.log(`Server running on port ${PORT}`);
}

main();

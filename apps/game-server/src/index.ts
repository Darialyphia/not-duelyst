import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { api } from '@hc/api';
import { ConvexHttpClient } from 'convex/browser';
import { UserDto } from '@hc/api/convex/users/user.mapper';
import { handlePlayerSocket } from './player';
import { handleSpectatorSocket } from './spectator';
// eslint-disable-next-line import/no-unresolved
import { Id } from '@hc/api/convex/_generated/dataModel';
import { Game } from './game';
import { GameServer } from './types';

const PORT = process.env.PORT || 8000;

async function main() {
  const ongoingGames = new Map<string, Game>();
  const httpServer = createServer();
  const io: GameServer = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  httpServer.listen(PORT);

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    const client = new ConvexHttpClient(process.env.CONVEX_URL!);

    console.log('new connection', token);
    const user = await client.query(api.users.me, { sessionId: token });
    if (!user) return next(new Error('Unauthorized'));

    socket.data.convexClient = client;
    socket.data.user = user;
    socket.data.sessionId = token;
    next();
  });

  io.on('connection', async socket => {
    const isSpectator = socket.handshake.query.spectator as string;
    const gameId = socket.handshake.query.gameId as Id<'games'>;
    if (!isSpectator) {
      handlePlayerSocket(io, socket, ongoingGames);
    } else {
      handleSpectatorSocket(io, socket, ongoingGames, gameId);
    }
  });

  console.log(`Server running on port ${PORT}`);
}

main();

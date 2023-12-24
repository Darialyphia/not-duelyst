import { Server } from 'socket.io';
import { GameSession, SerializedGameState } from '../game-session';

export const makeServerSessionSocketAdapter = (
  io: Server<any, any, any, { userId: string }>
) => {
  const ongoingGames = new Map<string, GameSession>();

  io.on('connection', async socket => {
    socket.on(
      'game:input',
      ({ gameId, type, payload }: { gameId: string; type: any; payload: any }) => {
        const game = ongoingGames.get(gameId);
        if (!game) return;
        game.dispatchPlayerInput({
          type: type,
          payload: { ...payload, playerId: socket.data.userId }
        });
      }
    );

    socket.on('game:subscribe', (gameId: string, ack: any) => {
      const game = ongoingGames.get(gameId);
      if (!game) {
        console.log('game not found', gameId);
        return;
      }
      socket.join(gameId);
      ack(game.serialize());
    });
  });

  return {
    async createSession(gameId: string, state: SerializedGameState) {
      const session = GameSession.createServerSession(state);
      session.subscribe(action => {
        io.in(gameId).emit('game:action', { gameId, action: action.serialize() });
      });

      ongoingGames.set(gameId, session);

      return session;
    }
  };
};

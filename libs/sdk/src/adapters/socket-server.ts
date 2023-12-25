import { Server, Socket } from 'socket.io';
import { GameSession, SerializedGameState } from '../game-session';

export const makeServerSessionSocketAdapter = (io: Server) => {
  const ongoingGames = new Map<
    string,
    { session: GameSession; playerJoined: string[] }
  >();

  return {
    async join(
      socket: Socket,
      userId: string,
      gameId: string,
      state: SerializedGameState
    ) {
      if (!ongoingGames.has(gameId)) {
        const session = GameSession.createServerSession(state);
        session.subscribe(action => {
          io.in(gameId).emit('game:action', { gameId, action: action.serialize() });
        });

        ongoingGames.set(gameId, { session, playerJoined: [userId] });
      }

      const game = ongoingGames.get(gameId)!;

      socket.on(
        'game:input',
        ({ type, payload }: { gameId: string; type: any; payload: any }) => {
          game.session.dispatchPlayerInput({
            type: type,
            payload: { ...payload, playerId: socket.data.userId }
          });
        }
      );

      socket.join(gameId);
      if (game.playerJoined.length === 2) {
        io.in(gameId).emit('game:init', game.session.serialize());
      }

      return ongoingGames.get(gameId)!;
    }
  };
};

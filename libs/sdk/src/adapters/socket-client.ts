import { Socket } from 'socket.io-client';
import { GameSession, SerializedGameState } from '../game-session';

export const makeClientSessionSocketAdapter = (socket: Socket) => {
  return {
    subscribe(gameId: string) {
      return new Promise(resolve => {
        socket.emit('game:subscribe', gameId, (serializedState: SerializedGameState) => {
          const session = GameSession.createClientSession(serializedState);

          socket.on('game:action', (arg: any) => {
            if (gameId !== arg.gameId) return;
            session.dispatchAction(arg.action);
          });

          resolve({
            session,
            dispatch(
              type: Parameters<GameSession['dispatchPlayerInput']>[0]['type'],
              payload: any
            ) {
              socket.emit('game:input', { gameId, type, payload });
            }
          });
        });
      });
    }
  };
};

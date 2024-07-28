import { api } from '@game/api';
import { io, type Socket } from 'socket.io-client';

const POLLING_INTERVAL = 3000;

export const useGameSocket = ({
  roomId,
  gameId,
  spectator,
  onConnected
}: {
  roomId: string;
  gameId: MaybeRefOrGetter<string | undefined>;
  spectator: boolean;
  onConnected: (socket: Socket) => any;
}) => {
  const sessionId = useSessionId();
  const { $hathora } = useNuxtApp();

  const _gameId = computed(() => toValue(gameId));
  const { data: featureFlags } = useConvexQuery(api.featureFlags.all, {});

  let socket: Socket;
  const error = ref<string>();

  const connect = async () => {
    try {
      await until(_gameId).not.toBe(undefined);

      const getUrl = async (): Promise<string> => {
        if (!featureFlags.value.hathora_rooms) {
          return `ws://localhost:8000?spectator=${spectator}&gameId=${_gameId.value}&roomId=${roomId}`;
        }

        const response = await $hathora.roomsV2.getConnectionInfo(roomId);
        if (response.status !== 'active') {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(getUrl());
            }, POLLING_INTERVAL);
          });
        }
        const exposedPort = response.exposedPort!;

        return `wss://${exposedPort?.host}:${exposedPort?.port}?spectator=${spectator}&roomId=${roomId}&gameId=${_gameId.value}`;
      };

      const socketUrl = await getUrl();

      socket = io(socketUrl, {
        transports: ['websocket'],
        upgrade: false,
        auth: {
          token: sessionId.value
        }
      });

      socket?.on('connect_error', err => {
        console.log(err);
        error.value = err.message;
      });
      socket?.on('error', err => {
        console.log(err);
        error.value = err;
      });

      return socket;
    } catch (err) {
      console.log(err);
      error.value =
        err instanceof Error
          ? err.message
          : 'An error has occured while creating the game room';
    }
  };

  until(featureFlags)
    .toBeTruthy()
    .then(async () => {
      await connect();
      onConnected(socket);
    });

  onUnmounted(() => {
    socket?.disconnect();
  });

  return { error };
};

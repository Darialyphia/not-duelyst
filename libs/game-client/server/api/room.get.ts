import { getHathoraClient } from '../hathora';
import { ConnectionInfoV2 } from '@hathora/cloud-sdk-typescript/dist/sdk/models/shared';

const wait = (duration: number) =>
  new Promise<void>(res => {
    setTimeout(res, duration);
  });

const GET_ROOM_POLLING_INTERVAL = 3000;
const GET_ROOM_POLLING_MAX_TRIES = 10;

export default defineEventHandler(async (event): Promise<string> => {
  const config = useRuntimeConfig();
  if (!config.hathoraAppId) {
    return 'ws://localhost:8000';
  } else {
    const { roomId } = getQuery<{ roomId: string }>(event);
    let tries = 0;
    let exposedPort: ConnectionInfoV2['exposedPort'] = undefined;
    do {
      const response = await getHathoraClient().roomV2.getConnectionInfo(roomId);
      if (response.connectionInfoV2?.status === 'active') {
        exposedPort = response.connectionInfoV2!.exposedPort!;
      } else {
        console.log(`Room not activer, try ${tries} of ${GET_ROOM_POLLING_MAX_TRIES}`);
        tries++;
        if (tries > GET_ROOM_POLLING_MAX_TRIES) break;
        await wait(GET_ROOM_POLLING_INTERVAL);
      }
    } while (!exposedPort);

    if (!exposedPort) {
      throw new Error(`could not get the connection info for room ${roomId}`);
    }

    return `wss://${exposedPort?.host}:${exposedPort?.port}`;
  }
});

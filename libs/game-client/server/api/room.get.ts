import { getHathoraClient } from '../hathora';

export default defineEventHandler(async (event): Promise<string> => {
  const config = useRuntimeConfig();

  if (!config.hathoraAppId) {
    return 'ws://localhost:8000';
  } else {
    const { roomId } = getQuery<{ roomId: string }>(event);

    const response = await getHathoraClient().roomV2.getConnectionInfo(roomId);
    const info = response.connectionInfoV2;

    if (!info) {
      throw new Error(`could not get the connection info for room ${roomId}`);
    }

    return `wss://'${info.exposedPort?.host}:${info.exposedPort?.port}`;
  }
});

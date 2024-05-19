import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import { internalAction } from '../../_generated/server';
import { Region } from '@hathora/cloud-sdk-typescript/dist/sdk/models/shared';

export const getHathoraRoomIdUsecase = internalAction(async () => {
  if (!process.env.HATHORA_TOKEN) return 'dev';

  const hathoraSdk = new HathoraCloud({
    appId: process.env.HATHORA_APP_ID,
    security: {
      hathoraDevToken: process.env.HATHORA_TOKEN!
    }
  });

  const room = await hathoraSdk.roomV2.createRoom({ region: Region.London });
  if (room.statusCode !== 201) {
    throw new Error('could not get room Id from Hathora');
  }

  return room.connectionInfoV2!.roomId;
});

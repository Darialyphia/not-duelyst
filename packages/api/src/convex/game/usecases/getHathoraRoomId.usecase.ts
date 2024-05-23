import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import { internalAction } from '../../_generated/server';
import { Region } from '@hathora/cloud-sdk-typescript/dist/sdk/models/shared';
import { api } from '../../_generated/api';

export const getHathoraRoomIdUsecase = internalAction(async ctx => {
  const featureFlags = await ctx.runQuery(api.featureFlags.all);

  if (!featureFlags.hathora_rooms) return 'dev';

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

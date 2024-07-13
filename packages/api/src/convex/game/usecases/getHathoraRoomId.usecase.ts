import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import { internalAction } from '../../_generated/server';
import { api } from '../../_generated/api';
import { Region } from '@hathora/cloud-sdk-typescript/models/components';

export const getHathoraRoomIdUsecase = internalAction(async ctx => {
  const featureFlags = await ctx.runQuery(api.featureFlags.all);

  if (!featureFlags.hathora_rooms) return 'dev';

  const hathoraSdk = new HathoraCloud({
    appId: process.env.HATHORA_APP_ID,
    hathoraDevToken: process.env.HATHORA_TOKEN!
  });

  const room = await hathoraSdk.roomsV2.createRoom({ region: Region.London });

  return room.roomId;
});

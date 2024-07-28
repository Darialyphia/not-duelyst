import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import { v } from 'convex/values';
import { internalAction } from '../../_generated/server';
import { api } from '../../_generated/api';

export const destroyHathoraRoomUsecase = internalAction({
  args: {
    roomId: v.string()
  },
  async handler(ctx, args) {
    const featureFlags = await ctx.runQuery(api.featureFlags.all);
    if (!featureFlags.hathora_rooms) return;

    const hathoraSdk = new HathoraCloud({
      appId: process.env.HATHORA_APP_ID,
      hathoraDevToken: process.env.HATHORA_TOKEN!
    });

    await hathoraSdk.roomsV2.destroyRoom(args.roomId);
  }
});

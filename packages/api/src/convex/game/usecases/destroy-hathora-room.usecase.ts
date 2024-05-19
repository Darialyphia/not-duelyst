import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import { v } from 'convex/values';
import { internalAction } from '../../_generated/server';

export const destroyHathoraRoomUsecase = internalAction({
  args: {
    roomId: v.string()
  },
  async handler(ctx, args) {
    if (!process.env.HATHORA_TOKEN) return;

    const hathoraSdk = new HathoraCloud({
      appId: process.env.HATHORA_APP_ID,
      security: {
        hathoraDevToken: process.env.HATHORA_TOKEN!
      }
    });

    await hathoraSdk.roomV2.destroyRoom(args.roomId);
  }
});

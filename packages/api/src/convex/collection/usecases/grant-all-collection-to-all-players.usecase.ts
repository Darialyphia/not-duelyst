import { internal } from '../../_generated/api';
import { internalAction } from '../../_generated/server';

export const grantAllCollectionToAllPlayersUsecase = internalAction(async ctx => {
  const users = await ctx.runQuery(internal.users.all);

  await Promise.all(
    users.map(user => {
      return ctx.runMutation(internal.collection.grantAllCollection, {
        userId: user._id
      });
    })
  );

  return true;
});

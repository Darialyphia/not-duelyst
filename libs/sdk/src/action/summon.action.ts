import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GameContext } from '../game';
import { ACTION_NAME } from './action-reducer';
import { ensureActiveEntityBelongsToPlayer, isGeneral } from '../entity/entity-utils';
import { UnitId, isUnitId } from '../units/unit-lookup';
import { SummonEvent } from '../event/summon.event';

const summonEventSchema = defaultActionSchema.extend({
  unitId: z
    .string()
    .refine(val => isUnitId(val))
    .transform(val => val as UnitId),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  })
});

export class SummonAction extends GameAction<typeof summonEventSchema> {
  protected name = ACTION_NAME.END_TURN;

  protected payloadSchema = summonEventSchema;

  private canSummon(ctx: GameContext) {
    return (
      ensureActiveEntityBelongsToPlayer(ctx, this.payload.playerId) &&
      isGeneral(ctx.atb.activeEntity) &&
      ctx.map.canSummonAt(this.payload.position) &&
      ctx.entityManager.hasNearbyAllies(this.payload.position, this.payload.playerId) &&
      ctx.playerManager.getActivePlayer().canSummon(ctx, this.payload.unitId)
    );
  }

  impl(ctx: GameContext) {
    if (this.canSummon(ctx)) {
      return new SummonEvent({ ...this.payload, atbSeed: Math.random() }).execute(ctx);
    }
  }
}

import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GameContext } from '../game';
import { ACTION_NAME } from './action-reducer';
import {
  ensureActiveEntityBelongsToPlayer,
  getSurroundingEntities,
  hasAllyNearby,
  isGeneral
} from '../entity/entity-utils';
import { canSummonAt } from '../map/map-utils';
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

type SummonActionPayload = z.infer<typeof summonEventSchema>;

export class SummonAction extends GameAction<typeof summonEventSchema> {
  protected name = ACTION_NAME.END_TURN;

  protected payloadSchema = summonEventSchema;

  impl(payload: SummonActionPayload, ctx: GameContext) {
    if (!ensureActiveEntityBelongsToPlayer(ctx, payload.playerId)) return;

    if (!ensureActiveEntityBelongsToPlayer(ctx, payload.playerId)) return;
    if (isGeneral(ctx.atb.activeEntity)) return;
    if (canSummonAt(ctx, payload.position)) return;
    if (!hasAllyNearby(ctx, payload.position, payload.playerId)) return;
    if (!ctx.playerManager.getActivePlayer().canSummon(ctx, payload.unitId)) {
      return false;
    }

    return new SummonEvent({ ...payload, atbSeed: Math.random() }).execute(ctx);
  }
}

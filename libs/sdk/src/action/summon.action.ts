import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GameContext } from '../game';
import { ACTION_NAME } from './action-reducer';
import { ensureActiveEntityBelongsToPlayer, isGeneral } from '../entity/entity-utils';
import { UnitId, isUnitId } from '../units/unit-lookup';
import { SummonFromLoadoutEvent } from '../event/summon-from-loadout.event';

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

  private get canSummon() {
    return (
      ensureActiveEntityBelongsToPlayer(this.ctx, this.payload.playerId) &&
      isGeneral(this.ctx.atb.activeEntity) &&
      this.ctx.map.canSummonAt(this.payload.position) &&
      this.ctx.entityManager.hasNearbyAllies(
        this.payload.position,
        this.payload.playerId
      ) &&
      this.ctx.playerManager.getActivePlayer().canSummon(this.ctx, this.payload.unitId)
    );
  }

  impl() {
    if (!this.canSummon) return;

    this.ctx.history.add(
      new SummonFromLoadoutEvent(
        {
          ...this.payload,
          atbSeed: Math.random()
        },
        this.ctx
      ).execute()
    );
  }
}

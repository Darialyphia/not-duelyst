import { z } from 'zod';
import { PlayerInput, defaultInputSchema } from './input';
import { INPUT_NAME } from './input-reducer';
import { UnitId, isUnitId } from '../units/unit-lookup';
import { SummonFromLoadoutAction } from '../action/summon-from-loadout.action';

const summonEventSchema = defaultInputSchema.extend({
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

export class SummonInput extends PlayerInput<typeof summonEventSchema> {
  readonly name = INPUT_NAME.SUMMON;

  protected payloadSchema = summonEventSchema;

  private get canSummon() {
    return (
      this.ctx.map.canSummonAt(this.payload.position) &&
      this.ctx.playerManager.getActivePlayer().canSummon(this.payload.unitId)
    );
  }

  impl() {
    if (!this.canSummon) return;
    this.ctx.actionQueue.push(
      new SummonFromLoadoutAction(
        this.payload,

        this.ctx
      )
    );
  }
}

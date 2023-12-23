import { EFFECTS } from '../effect/effect-lookup';
import { SerializedEntity } from '../entity/entity';
import { UNITS } from '../units/unit-lookup';
import { GameAction } from './action';

export class SummonFromLoadoutAction extends GameAction<Omit<SerializedEntity, 'id'>> {
  readonly name = 'SUMMON_FROM_LOADOUT';

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    const player = this.ctx.playerManager.getPlayerById(this.payload.playerId);
    if (!player) throw new Error(`Player not found: ${this.payload.playerId}`);

    const unit = UNITS[this.payload.unitId];
    player.summonFromLoadout(unit);
    const entity = this.ctx.entityManager.addEntity(this.payload);
    const effect = new EFFECTS.exhausted(this.ctx, entity, {});
    effect.attach(entity);
  }
}

import { EFFECTS } from '../effect/effect-lookup';
import { SerializedEntity } from '../entity/entity';
import { Point3D } from '../types';
import { UNITS } from '../units/unit-lookup';
import { GameAction } from './action';

export class SummonFromLoadoutAction extends GameAction<
  Omit<SerializedEntity, 'id'> & { targets: Point3D[] }
> {
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

    const hasRush = entity.effects.some(e => e.id === 'rush');
    if (!hasRush) {
      new EFFECTS.exhausted(this.ctx, entity, {}).attach(entity);
    }

    if (unit.onSummoned) {
      unit.onSummoned.execute(this.ctx, this.payload.targets, entity);
    }
  }
}

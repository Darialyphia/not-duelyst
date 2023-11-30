import { SerializedEntity } from '../entity/entity';
import { GameContext } from '../game';
import { UNITS } from '../units/unit-lookup';
import { EVENT_NAME, GameEvent } from './event';

export type SummonFromLoadoutEventPayload = Omit<SerializedEntity, 'id'>;

export class SummonFromLoadoutEvent extends GameEvent<SummonFromLoadoutEventPayload> {
  protected name = EVENT_NAME.SUMMON_FROM_LOADOUT;

  protected impl() {
    const player = this.ctx.playerManager.getPlayerById(this.payload.playerId);
    if (!player) throw new Error(`Player not found: ${this.payload.playerId}`);

    const unit = UNITS[this.payload.unitId];
    this.ctx.entityManager.addEntity(this.payload);
    this.ctx.atb.activeEntity.ap -= unit.summonCost;
    player.loadout.units[this.payload.unitId].cooldown = unit.summonCooldown;
  }
}

import { SerializedEntity } from '../entity/entity';
import { GameContext } from '../game';
import { UNITS } from '../units/unit-lookup';
import { EVENT_NAME, GameEvent } from './event';

export type SummonEventPayload = Omit<SerializedEntity, 'id'>;

export class SummonEvent extends GameEvent<SummonEventPayload> {
  protected name = EVENT_NAME.SUMMON;

  impl(ctx: GameContext) {
    const player = ctx.playerManager.getPlayerById(this.payload.playerId);
    if (!player) throw new Error(`Player not found: ${this.payload.playerId}`);

    const unit = UNITS[this.payload.unitId];
    ctx.entityManager.addEntity(this.payload);
    ctx.atb.activeEntity.ap -= unit.summonCost;
    player.loadout.units[this.payload.unitId].cooldown = unit.summonCooldown;
  }
}

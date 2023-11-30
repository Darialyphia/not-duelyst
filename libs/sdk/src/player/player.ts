import { isDefined } from '@hc/shared';
import { UNITS, UnitBlueprint, UnitId } from '../units/unit-lookup';
import { GameContext } from '../game';
import { Serializable } from '../utils/interfaces';

export type PlayerId = string;

export type Loadout = {
  units: Record<UnitId, { cooldown: number }>;
};

export class Player implements Serializable {
  constructor(
    public readonly id: PlayerId,
    public readonly loadout: Loadout
  ) {}

  canSummon(ctx: GameContext, unitId: UnitId) {
    const unit = UNITS[unitId];
    const loadoutUnit = this.loadout.units[unitId];
    if (!isDefined(loadoutUnit)) return false;

    const general = ctx.entityManager.getGeneral(this.id);

    return loadoutUnit.cooldown === 0 && general.ap >= unit.summonCost;
  }

  serialize() {
    return {
      id: this.id,
      loadout: this.loadout
    };
  }
}

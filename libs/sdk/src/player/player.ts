import { isDefined } from '@hc/shared';
import { UNITS, UnitBlueprint, UnitId } from '../units/unit-lookup';
import { GameContext } from '../game';
import { getGeneral } from '../entity/entity-utils';

export type PlayerId = string;

export type Loadout = {
  units: Record<UnitId, { cooldown: number }>;
};

export class Player {
  constructor(
    public readonly id: PlayerId,
    public readonly loadout: Loadout
  ) {}

  canSummon(ctx: GameContext, unitId: UnitId) {
    const unit = UNITS[unitId];

    if (!isDefined(this.loadout.units[unitId])) return false;

    const general = getGeneral(ctx, this.id);

    return (
      this.loadout.units[unitId].cooldown > 0 && general.ap >= unit.summonCost
    );
  }

  serialize() {
    return {
      id: this.id,
      loadout: this.loadout
    };
  }
}

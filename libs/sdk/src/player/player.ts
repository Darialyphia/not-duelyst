import { isDefined } from '@hc/shared';
import { UNITS, UnitId } from '../units/unit-lookup';
import { Serializable } from '../utils/interfaces';
import { GameSession } from '../game-session';

export type PlayerId = string;

export type Loadout = {
  units: Record<UnitId, { cooldown: number }>;
};

export class Player implements Serializable {
  constructor(
    private ctx: GameSession,
    public readonly id: PlayerId,
    public readonly loadout: Loadout,
    public readonly generalId: UnitId
  ) {}

  serialize() {
    return {
      id: this.id,
      loadout: this.loadout,
      generalId: this.generalId
    };
  }

  clone() {
    const clone = new Player(this.ctx, this.id, this.loadout, this.generalId);

    Object.keys(this).forEach(key => {
      // @ts-expect-error cant be arsed
      clone[key] = this[key];
    });

    return clone;
  }

  canSummon(unitId: UnitId) {
    const unit = UNITS[unitId];
    const loadoutUnit = this.loadout.units[unitId];
    if (!isDefined(loadoutUnit)) return false;

    const general = this.ctx.entityManager.getGeneral(this.id);

    if (general.effects.some(effect => effect.id === 'meditating')) return false;
    return loadoutUnit.cooldown === 0 && general.ap >= unit.summonCost;
  }

  get summonableUnits() {
    return Object.entries(this.loadout.units).map(([unitId, info]) => ({
      unit: UNITS[unitId],
      ...info
    }));
  }
}

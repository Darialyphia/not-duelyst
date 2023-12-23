import { clamp, isDefined } from '@hc/shared';
import { UNITS, UnitBlueprint, UnitId } from '../units/unit-lookup';
import { Serializable } from '../utils/interfaces';
import { GameSession } from '../game-session';
import { Entity } from '../entity/entity';

export type PlayerId = string;

export type Loadout = {
  units: Record<UnitId, { cooldown: number }>;
};

export class Player implements Serializable {
  constructor(
    private ctx: GameSession,
    public readonly id: PlayerId,
    public readonly loadout: Loadout,
    public readonly generalId: UnitId,
    public gold: number
  ) {
    this.ctx.emitter.on('game:turn-start', player => {
      if (ctx.turn <= 1) return;

      if (player.id === this.id) {
        Object.entries(this.loadout.units).forEach(([, unit]) => {
          unit.cooldown = clamp(unit.cooldown - 1, 0, Infinity);
        });
        this.gold += 2;
      }
    });
  }

  serialize() {
    return structuredClone({
      id: this.id,
      loadout: this.loadout,
      generalId: this.generalId,
      gold: this.gold
    });
  }

  clone() {
    const clone = new Player(this.ctx, this.id, this.loadout, this.generalId, this.gold);

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

    return loadoutUnit.cooldown === 0 && this.gold >= unit.summonCost;
  }

  summonFromLoadout(unit: UnitBlueprint) {
    if (!this.canSummon(unit.id)) return;

    this.gold = clamp(this.gold - unit.summonCost, 0, Infinity);
    // this.loadout.units[unit.id].cooldown = unit.summonCooldown;
  }

  get summonableUnits() {
    return Object.entries(this.loadout.units).map(([unitId, info]) => ({
      unit: UNITS[unitId],
      ...info
    }));
  }

  get entities() {
    return this.ctx.entityManager.getList().filter(e => e.playerId === this.id);
  }

  get general() {
    return this.ctx.entityManager.getGeneral(this.id);
  }

  get opponent() {
    return this.ctx.playerManager.getOpponent(this.id);
  }

  ownsEntity(entity: Entity) {
    return entity.playerId === this.id;
  }
}

import { clamp, isDefined } from '@hc/shared';
import { UNITS, UnitBlueprint, UnitId } from '../units/unit-lookup';
import { Serializable } from '../utils/interfaces';
import { GameSession } from '../game-session';
import { Entity } from '../entity/entity';
import type { SerializedPlayer } from './player-manager';
export type PlayerId = string;

export type Loadout = {
  units: Record<UnitId, { cooldown: number }>;
};

export class Player implements Serializable {
  public readonly id: PlayerId;
  public readonly name: string;
  public readonly loadout: Loadout;
  public readonly generalId: UnitId;
  public gold: number;

  constructor(
    private ctx: GameSession,
    options: SerializedPlayer
  ) {
    this.id = options.id;
    this.name = options.name;
    this.loadout = options.loadout;
    this.generalId = options.generalId;
    this.gold = options.gold;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      loadout: this.loadout,
      generalId: this.generalId,
      gold: this.gold
    };
  }

  equals(player: Player) {
    return player.id === this.id;
  }

  clone() {
    return new Player(this.ctx, this.serialize());
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

    this.loadout.units[unit.id].cooldown = unit.summonCooldown;
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

  startTurn() {
    Object.entries(this.loadout.units).forEach(([, unit]) => {
      unit.cooldown = clamp(unit.cooldown - 1, 0, Infinity);
    });
    this.gold += 2;
  }
}

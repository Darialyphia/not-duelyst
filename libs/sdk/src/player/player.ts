import { UnitId } from '../units/unit-lookup';

export type PlayerId = string;

export type Loadout = {
  units: Record<UnitId, { cooldown: number }>;
};

export class Player {
  constructor(
    public readonly id: PlayerId,
    public readonly loadout: Loadout
  ) {}

  serialize() {
    return {
      id: this.id,
      loadout: this.loadout
    };
  }
}

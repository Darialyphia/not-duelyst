import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';

export type EffectId = string;

export abstract class Effect {
  abstract readonly id: EffectId;
  abstract duration: number;
  entity?: Entity;

  constructor(
    protected ctx: GameSession,
    public source: Entity
  ) {
    this.tick = this.tick.bind(this);
    this.detach = this.detach.bind(this);
  }

  attach(entity: Entity) {
    this.entity = entity;
    this.entity.effects.push(this);

    this.entity.on('turn-start', this.tick);
    this.entity.on('die', this.detach);

    this.onApplied();
  }

  detach() {
    if (!this.entity) return;

    const idx = this.entity.effects.indexOf(this);
    this.entity.effects.splice(idx);

    this.entity.off('turn-start', this.tick);
    this.entity.off('die', this.detach);
  }

  protected tick() {
    if (!this.entity) return;

    this.duration--;
    if (this.duration === 0) {
      this.detach();
      this.onExpired();
    }
  }

  onApplied() {
    return;
  }

  onExpired() {
    return;
  }
}

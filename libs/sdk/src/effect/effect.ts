import { AnyObject } from '@hc/shared';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';

export type EffectId = string;

export abstract class Effect {
  abstract readonly id: EffectId;
  abstract duration: number;
  attachedTo?: Entity;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: AnyObject
  ) {
    this.tick = this.tick.bind(this);
    this.detach = this.detach.bind(this);
  }

  attach(entity: Entity) {
    this.attachedTo = entity;
    this.attachedTo.effects.push(this);

    this.attachedTo.on('turn-start', this.tick);
    this.attachedTo.on('die', this.detach);

    this.onApplied();
  }

  detach() {
    if (!this.attachedTo) return;

    const idx = this.attachedTo.effects.indexOf(this);
    this.attachedTo.effects.splice(idx);

    this.attachedTo.off('turn-start', this.tick);
    this.attachedTo.off('die', this.detach);
  }

  protected tick() {
    if (!this.attachedTo) return;

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

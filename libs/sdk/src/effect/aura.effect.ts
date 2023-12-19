import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { isWithinCells } from '../skill/skill-utils';
import { Effect } from './effect';

export abstract class AuraEffect extends Effect {
  abstract readonly id: string;
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { duration: number; range: number }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;

    this.checkAura = this.checkAura.bind(this);
  }

  abstract isElligible(entity: Entity): boolean;

  abstract applyAura(entity: Entity): void;

  abstract removeAura(entity: Entity): void;

  private checkAura() {
    this.ctx.entityManager.getList().forEach(entity => {
      if (!this.isElligible(entity)) {
        return this.removeAura(entity);
      }

      const isInRange = isWithinCells(
        this.ctx,
        this.source.position,
        entity.position,
        this.meta.range
      );
      if (!isInRange) return this.removeAura(entity);

      this.applyAura(entity);
    });
  }

  onApplied() {
    this.ctx.emitter.on('entity:move', this.checkAura);
    this.ctx.emitter.on('entity:destroyed', this.checkAura);
    this.ctx.emitter.on('entity:created', this.checkAura);
  }

  onExpired() {
    this.ctx.emitter.off('entity:move', this.checkAura);
    this.ctx.emitter.off('entity:destroyed', this.checkAura);
    this.ctx.emitter.off('entity:created', this.checkAura);
  }
}

import { Nullable } from '@hc/shared';
import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Skill } from '../skill/skill';
import { isWithinCells } from '../skill/skill-utils';
import { Point3D } from '../types';
import { Effect } from './effect';

export class ThornsEffect extends Effect {
  readonly id = 'thorns';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { duration: number; damage: number; isTrueDamage: boolean }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;

    this.applyThorns = this.applyThorns.bind(this);
  }

  getDescription(): string {
    const damage = this.meta.isTrueDamage
      ? this.meta.damage
      : this.meta.damage + this.attachedTo!.attack;

    return `When this unit receives damage, it deals ${damage} back.`;
  }

  private applyThorns({ source }: { source: Nullable<Entity> }) {
    if (!source) return;
    this.ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.meta.damage,
          sourceId: this.attachedTo!.id,
          targets: [source.id],
          isTrueDamage: this.meta.isTrueDamage
        },
        this.ctx
      )
    );
  }

  onApplied() {
    this.attachedTo?.on('receive-damage', this.applyThorns);
  }

  onExpired() {
    this.attachedTo?.off('receive-damage', this.applyThorns);
  }
}

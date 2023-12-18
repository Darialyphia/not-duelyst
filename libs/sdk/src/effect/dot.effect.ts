import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Effect } from './effect';

export class DotEffect extends Effect {
  readonly id = 'dot';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { duration: number; power: number }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;

    this.applyDot = this.applyDot.bind(this);
  }

  applyDot(entity: Entity) {
    this.ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.meta.power,
          sourceId: this.source.id,
          targets: [entity.id],
          isTrueDamage: true
        },
        this.ctx
      )
    );
  }

  onApplied() {
    this.attachedTo?.on('turn-end', this.applyDot);
  }

  onExpired() {
    this.attachedTo?.off('turn-end', this.applyDot);
  }
}

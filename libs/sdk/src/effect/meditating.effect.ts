import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Effect } from './effect';

export class MeditatingEffect extends Effect {
  readonly id = 'meditating';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: Record<string, never>
  ) {
    super(ctx, source, meta);
    this.duration = 1;

    this.apply = this.apply.bind(this);
  }

  apply() {
    return false;
  }

  onApplied() {
    this.attachedTo?.addInterceptor('canUseSkill', this.apply);
    this.attachedTo?.addInterceptor('canMove', this.apply);
  }

  onExpired() {
    this.attachedTo?.removeInterceptor('canUseSkill', this.apply);
    this.attachedTo?.removeInterceptor('canMove', this.apply);
  }
}

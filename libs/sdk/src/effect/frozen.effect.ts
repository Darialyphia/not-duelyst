import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Effect } from './effect';

export class FrozenEffect extends Effect {
  readonly id = 'frozen';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { duration: number }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;

    this.applyRoot = this.applyRoot.bind(this);
    this.applyDefenseModifier = this.applyDefenseModifier.bind(this);
  }

  getDescription(): string {
    return `This units cannot move, cannot cast abilities, and has +1 defense.`;
  }

  applyRoot() {
    return false;
  }

  applyDefenseModifier(value: number) {
    return value + 1;
  }

  onApplied() {
    this.attachedTo?.addInterceptor('canMove', this.applyRoot);
    this.attachedTo?.addInterceptor('canUseSkill', this.applyRoot);
    this.attachedTo?.addInterceptor('defense', this.applyDefenseModifier);
  }

  onExpired() {
    this.attachedTo?.removeInterceptor('canMove', this.applyRoot);
    this.attachedTo?.removeInterceptor('canUseSkill', this.applyRoot);
    this.attachedTo?.removeInterceptor('defense', this.applyDefenseModifier);
  }
}

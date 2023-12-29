import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Effect } from './effect';

export class AoeOnDeathEffect extends Effect {
  readonly id = 'aoe-on-death';
  duration = Infinity;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { power: number }
  ) {
    super(ctx, source, meta);

    this.onDeath = this.onDeath.bind(this);
  }

  getDescription(): string {
    return `This units deals ${this.meta.power} damage to nearby enemies when it dies.`;
  }

  onDeath({ entity }: { entity: Entity }) {
    const enemies = this.ctx.entityManager.getNearbyEnemies(
      entity.position,
      entity.playerId
    );

    this.ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.meta.power,
          sourceId: entity.id,
          targets: enemies.map(e => e.id),
          isTrueDamage: true
        },
        this.ctx
      )
    );
  }

  onApplied() {
    this.attachedTo?.on('die', this.onDeath.bind(this));
  }

  onExpired() {
    this.attachedTo?.off('die', this.onDeath.bind(this));
  }
}

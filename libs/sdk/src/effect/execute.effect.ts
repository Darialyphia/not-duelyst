import { DieAction } from '../action/die.action';
import { Entity } from '../entity/entity';
import { isAlly } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { isWithinCells } from '../skill/skill-utils';
import { Effect } from './effect';

export class ExecuteEffect extends Effect {
  id = 'execute';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: {
      duration: number;
    }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;
    this.onDamage = this.onDamage.bind(this);
  }

  getDescription(): string {
    throw new Error('Whenever a nearby unit drops below 25% hp, destroy it');
  }

  onDamage({ entity }: { entity: Entity; amount: number }) {
    console.log('on damage');
    if (isAlly(this.ctx, entity.id, this.attachedTo!.playerId)) return;

    if (!isWithinCells(this.ctx, this.attachedTo!.position, entity.position, 1)) return;

    if (entity.hp === 0) return; // dont proc, a die action will already trigger

    console.log(entity.hp, entity.maxHp * 0.25);
    if (entity.hp <= entity.maxHp * 0.25) {
      this.ctx.actionQueue.push(
        new DieAction(
          {
            entityId: entity.id,
            sourceId: this.attachedTo!.id
          },
          this.ctx
        )
      );
    }
  }

  onApplied() {
    this.ctx.emitter?.on('entity:receive-damage', this.onDamage);
  }

  onExpired() {
    this.ctx.emitter?.on('entity:receive-damage', this.onDamage);
  }
}

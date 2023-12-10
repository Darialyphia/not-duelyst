import { EntityId } from '../entity/entity';
import { PlayerId } from '../player/player';
import { GameAction } from './action';
import { EndTurnAction } from './end-turn.action';

export class DieAction extends GameAction<{ entityId: EntityId }> {
  readonly name = 'DIE';

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;

    await this.ctx.fxContext.fadeOutEntity(this.payload.entityId, 0.5);
  }

  protected impl() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);

    entity.die();
    this.ctx.entityManager.removeEntity(entity);
    if (entity.equals(this.ctx.atb.activeEntity)) {
      this.ctx.actionQueue.push(
        new EndTurnAction({ playerId: entity.playerId }, this.ctx)
      );
    }
  }
}

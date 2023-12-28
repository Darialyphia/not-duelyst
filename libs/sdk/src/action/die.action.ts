import { EntityId } from '../entity/entity';
import { isGeneral } from '../entity/entity-utils';
import { GameAction } from './action';
import { EndGamection } from './end-game.action';

export class DieAction extends GameAction<{ entityId: EntityId; sourceId: EntityId }> {
  readonly name = 'DIE';

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;

    await this.ctx.fxContext.fadeOutEntity(this.payload.entityId, 0.8);
  }

  protected impl() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);
    const source = this.ctx.entityManager.getEntityById(this.payload.sourceId);
    if (!source) throw new Error(`Entity not found: ${this.payload.sourceId}`);

    entity.die(source);
    this.ctx.entityManager.removeEntity(entity);

    if (isGeneral(entity)) {
      this.ctx.actionQueue.push(
        new EndGamection(
          {
            winnerId: this.ctx.playerManager.getOpponent(entity.playerId).id
          },
          this.ctx
        )
      );
      return;
    }
  }
}

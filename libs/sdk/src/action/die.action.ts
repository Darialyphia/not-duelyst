import { EntityId } from '../entity/entity';
import { isGeneral } from '../entity/entity-utils';
import { GameAction } from './action';
import { EndGamection } from './end-game.action';
import { EndTurnAction } from './end-turn.action';

export class DieAction extends GameAction<{ entityId: EntityId }> {
  readonly name = 'DIE';

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;

    await this.ctx.fxContext.fadeOutEntity(this.payload.entityId, 0.8);
  }

  protected impl() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);

    entity.die();
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

    if (entity.equals(this.ctx.atb.activeEntity)) {
      this.ctx.actionQueue.push(
        new EndTurnAction({ playerId: entity.playerId }, this.ctx)
      );
    }
  }
}

import { EntityId, isEntityId } from '../entity/entity';
import { isGeneral } from '../entity/entity-utils';
import { InteractableId } from '../interactable/interactable';
import { GameAction } from './action';
import { EndGamection } from './end-game.action';

export class DieAction extends GameAction<{
  entityId: EntityId;
  sourceId: EntityId | InteractableId;
}> {
  readonly name = 'DIE';

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;

    await this.ctx.fxContext.fadeOutEntity(this.payload.entityId, 0.8);
  }

  get source() {
    if (!isEntityId(this.payload.sourceId, this.ctx)) return null;

    const source = this.ctx.entityManager.getEntityById(this.payload.sourceId);
    if (!source) throw new Error(`Entity not found: ${this.payload.sourceId}`);

    return source;
  }

  get entity() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);

    return entity;
  }

  get logMessage() {
    return `${this.entity.unitId} died.`;
  }
  protected impl() {
    this.entity.die(this.source);
    this.ctx.entityManager.removeEntity(this.entity);

    if (isGeneral(this.entity)) {
      this.ctx.actionQueue.push(
        new EndGamection(
          {
            winnerId: this.ctx.playerManager.getOpponent(this.entity.playerId).id
          },
          this.ctx
        )
      );
      return;
    }
  }
}

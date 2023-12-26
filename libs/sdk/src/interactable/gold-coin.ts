import { ModifyGoldAction } from '../action/modify-gold.action';
import { Interactable } from './interactable';

export class GoldCoin extends Interactable {
  id = 'GOLD_COIN';
  spriteId = 'gold-coin';
  isWalkable = true;
  isTargetable = false;

  private pickup() {
    const entity = this.ctx.entityManager.getEntityAt(this.position);
    if (entity) {
      console.log('pickup coin');
      this.ctx.actionQueue.push(
        new ModifyGoldAction({ playerId: entity.playerId, amount: 1 }, this.ctx)
      );
      this.destroy();
      this.ctx.emitter.off('game:turn-end', this.pickup.bind(this));
    }
  }

  init() {
    this.ctx.emitter.on('game:turn-end', this.pickup.bind(this));
  }
}

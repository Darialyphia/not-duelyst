import { CARD_KINDS } from '../card-enums';
import { Unit } from '../unit';
import { CardAction, noop } from './_card-action';

export class DealDamageCardAction extends CardAction<'deal_damage'> {
  async executeImpl() {
    await Promise.all(
      this.getUnits(this.action.params.targets).map(async target => {
        // we check the card instance AND presence of entity to handle essence cards
        if (this.ctx.card instanceof Unit && this.ctx.card.entity) {
          await this.ctx.card.entity.dealDamage(
            this.getAmount(this.action.params.amount),
            target
          );
        } else {
          await target.takeDamage(
            this.getAmount(this.action.params.amount),
            this.ctx.card
          );
        }
      })
    );
    return noop;
  }
}

import { Unit } from '../unit';
import { CardAction, noop } from './_card-action';

export class DealDamageCardAction extends CardAction<'deal_damage'> {
  executeImpl() {
    this.getUnits(this.action.params.targets).forEach(target => {
      if (this.ctx.card instanceof Unit) {
        this.ctx.card.entity.dealDamage(
          this.getAmount(this.action.params.amount),
          target
        );
      } else {
        target.takeDamage(this.getAmount(this.action.params.amount), this.ctx.card);
      }
    });

    return noop;
  }
}

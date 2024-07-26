import { CardAction, noop } from './_card-action';

export class HealCardAction extends CardAction<'heal'> {
  executeImpl() {
    this.getUnits(this.action.params.targets).forEach(target => {
      target.heal(this.getAmount(this.action.params.amount), this.ctx.card);
    });

    return noop;
  }
}

import { CardAction, noop } from './_card-action';

export class HealCardAction extends CardAction<'heal'> {
  async executeImpl() {
    await Promise.all(
      this.getUnits(this.action.params.targets).map(async target => {
        await target.heal(this.getAmount(this.action.params.amount), this.ctx.card);
      })
    );

    return noop;
  }
}

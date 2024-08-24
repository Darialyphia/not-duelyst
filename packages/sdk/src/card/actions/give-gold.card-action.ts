import { CardAction, noop } from './_card-action';

export class GiveGoldCardAction extends CardAction<'give_gold'> {
  protected async executeImpl() {
    const amount = this.getAmount(this.action.params.amount);
    await Promise.all(
      this.getPlayers(this.action.params.player).map(
        async player => await player.giveGold(amount)
      )
    );

    return noop;
  }
}

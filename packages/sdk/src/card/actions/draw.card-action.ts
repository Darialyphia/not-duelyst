import { CardAction, noop } from './_card-action';

export class DrawCardAction extends CardAction<'draw_cards'> {
  async executeImpl() {
    await Promise.all(
      this.getPlayers(this.action.params.player).map(async player => {
        const amount = this.getAmount(this.action.params.amount);
        if (this.action.params.kind) {
          player.drawFromKind(amount, this.action.params.kind);
        } else {
          await player.draw(amount);
        }
      })
    );

    return noop;
  }
}

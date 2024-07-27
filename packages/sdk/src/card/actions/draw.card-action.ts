import { CardAction, noop } from './_card-action';

export class DrawCardAction extends CardAction<'draw_cards'> {
  executeImpl() {
    this.session.logger('draw card action');
    this.getPlayers(this.action.params.player).forEach(player => {
      const amount = this.getAmount(this.action.params.amount);
      if (this.action.params.kind) {
        player.drawFromKind(amount, this.action.params.kind);
      } else {
        player.draw(amount);
      }
    });

    return noop;
  }
}

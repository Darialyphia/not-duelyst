import { CardAction, noop } from './_card-action';

export class DrawCardAction extends CardAction<'draw_cards'> {
  executeImpl() {
    this.getPlayers(this.action.params.player).forEach(player => {
      player.draw(this.getAmount(this.action.params.amount));
    });

    return noop;
  }
}

import { CardAction, noop } from './_card-action';

export class DestroyCardsInDeckCardAction extends CardAction<'destroy_cards_in_deck'> {
  protected async executeImpl() {
    const cards = this.getCards(this.action.params.card);

    this.getPlayers(this.action.params.player).forEach(player => {
      cards.forEach(card => {
        player.deck.pluck(card);
      });
    });

    return noop;
  }
}

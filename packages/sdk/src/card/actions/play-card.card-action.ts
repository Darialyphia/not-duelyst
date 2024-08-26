import { CardAction, noop } from './_card-action';

export class PlayCardCardAction extends CardAction<'play_card'> {
  protected async executeImpl() {
    const [card] = this.getCards(this.action.params.card);
    if (!card) return noop;

    const [position] = this.getCells(this.action.params.position);
    if (!position) return noop;
    if (!card.canPlayAt(position)) return noop;

    await card.player.playCard(card, {
      position,
      targets: this.getCells(this.action.params.targets),
      spendGold: false,
      choice: 0
    });

    return noop;
  }
}

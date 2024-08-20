import { PLAYER_EVENTS } from '../../player/player';
import { CardAction, noop } from './_card-action';

export class GenerateCardCardAction extends CardAction<'generate_card'> {
  protected async executeImpl() {
    this.getPlayers(this.action.params.player).forEach(player => {
      if (player.isHandFull) return;

      const card = player.generateCard({
        blueprintId: this.getBlueprint(this.action.params.blueprint),
        pedestalId: player.general.card.pedestalId,
        cardBackId: player.general.card.cardBackId
      });

      if (this.action.params.location === 'hand') {
        player.hand.push(card);
        if (this.action.params.ephemeral) {
          player.once(PLAYER_EVENTS.TURN_END, () => {
            player.hand.splice(player.hand.indexOf(card), 1);
          });
        }
      } else if (this.action.params.location === 'deck') {
        player.deck.cards.push(card);
        player.deck.shuffle();

        if (this.action.params.ephemeral) {
          player.once(PLAYER_EVENTS.TURN_END, () => {
            player.deck.cards.splice(player.hand.indexOf(card), 1);
          });
        }
      }
    });
    return noop;
  }
}

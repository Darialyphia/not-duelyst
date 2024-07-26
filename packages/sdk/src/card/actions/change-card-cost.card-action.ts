import { PLAYER_EVENTS } from '../../player/player';
import type { Card } from '../card';
import { CardAction, noop } from './_card-action';

export class ChangeCardCostCardAction extends CardAction<'change_card_cost'> {
  protected executeImpl() {
    const caster = this.ctx.card.player;

    const cleanups = this.getPlayers(this.action.params.player).map(player => {
      const cards = this.getCards(this.action.params.card);

      let occurences = 0;

      const unsub = player.addInterceptor('cost', (value, card) => {
        if (!player.hand.includes(card as Card)) return value;

        const isMatch = cards.some(c => c.equals(card as Card));
        if (!isMatch) return value;

        if (
          this.action.params.occurences_count &&
          occurences >= this.action.params.occurences_count
        ) {
          return value;
        }

        const amount = this.getAmount(this.action.params.amount);
        return value + amount;
      });

      if (this.action.params.occurences_count) {
        const onCardPlayed = ({ card }: { card: Card }) => {
          const isMatch = cards.some(c => c.equals(card as Card));
          if (!isMatch) return;
          occurences++;
          if (occurences >= this.action.params.occurences_count!) {
            unsub();
            player.off(PLAYER_EVENTS.AFTER_PLAY_CARD, onCardPlayed);
          }
        };

        player.on(PLAYER_EVENTS.AFTER_PLAY_CARD, onCardPlayed);
      }

      if (this.action.params.duration === 'end_of_turn') {
        caster.once('turn_end', unsub);
      }
      if (this.action.params.duration === 'start_of_next_turn') {
        caster.once('turn_start', unsub);
      }

      return unsub;
    });

    return () => cleanups.forEach(c => c());
  }
}

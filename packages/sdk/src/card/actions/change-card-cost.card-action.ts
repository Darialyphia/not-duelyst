import { Player, PLAYER_EVENTS } from '../../player/player';
import { CARD_EVENTS, type Card } from '../card';
import { CardAction } from './_card-action';

export class ChangeCardCostCardAction extends CardAction<'change_card_cost'> {
  addInterceptor(player: Player, meta: { occurences: number }) {
    const cards = this.getCards(this.action.params.card);

    return player.addInterceptor('cost', (value, card) => {
      if (!player.hand.includes(card as Card)) {
        return value;
      }

      const isMatch = cards.some(c => c.equals(card as Card));
      if (!isMatch) return value;

      const isActive = this.checkGlobalConditions(this.action.params.activeWhen);
      if (!isActive) return value;

      if (
        this.action.params.occurences_count &&
        meta.occurences >= this.action.params.occurences_count
      ) {
        return value;
      }

      const amount = this.getAmount(this.action.params.amount);
      return Math.max(0, value + amount);
    });
  }

  applyEffectToPlayers() {
    const caster = this.ctx.card.player;

    const cleanups = this.getPlayers(this.action.params.player).map(player => {
      const meta = { occurences: 0 };

      const unsub = this.addInterceptor(player, meta);

      if (this.action.params.occurences_count) {
        const onCardPlayed = ({ card }: { card: Card }) => {
          const cards = this.getCards(this.action.params.card);

          const isMatch =
            !card.equals(this.card) && cards.some(c => c.equals(card as Card));
          if (!isMatch) return;
          meta.occurences++;
          if (meta.occurences >= this.action.params.occurences_count!) {
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

      return () => {
        unsub();
      };
    });

    return cleanups;
  }
  protected async executeImpl() {
    let cleanups = this.applyEffectToPlayers();

    const stopOnOwnerChange = this.card.on(CARD_EVENTS.CHANGE_OWNER, () => {
      cleanups.forEach(c => c());
      cleanups = this.applyEffectToPlayers();
    });

    return () =>
      cleanups.forEach(cleanup => {
        cleanup();
        stopOnOwnerChange();
      });
  }
}

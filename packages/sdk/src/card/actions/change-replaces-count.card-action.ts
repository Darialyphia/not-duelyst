import { CARD_EVENTS } from '../card';
import { CardAction } from './_card-action';
import { match } from 'ts-pattern';

export class ChangeReplaceCountCardAction extends CardAction<'change_replaces_count'> {
  private makeInterceptor() {
    const staticValue = this.getAmount(this.action.params.amount);

    return (value: number) => {
      return match(this.action.params.mode)
        .with('give', () => value + this.getAmount(this.action.params.amount))
        .with('set', () => staticValue)
        .exhaustive();
    };
  }

  applyInterceptors() {
    const players = this.getPlayers(this.action.params.player);

    return players.map(player => {
      return player.addInterceptor('maxReplaces', this.makeInterceptor());
    });
  }

  protected async executeImpl() {
    const cleanups = {
      fns: this.applyInterceptors()
    };

    const stopOnOwnerChanged = this.card.on(CARD_EVENTS.CHANGE_OWNER, () => {
      cleanups.fns.forEach(c => c());
      cleanups.fns = this.applyInterceptors();
    });

    const stop = () => {
      cleanups.fns.forEach(c => c());
      stopOnOwnerChanged();
    };

    if (this.action.params.duration === 'end_of_turn') {
      this.ctx.card.player.once('turn_end', stop);
    }
    if (this.action.params.duration === 'start_of_next_turn') {
      this.ctx.card.player.once('turn_start', stop);
    }

    return stop;
  }
}

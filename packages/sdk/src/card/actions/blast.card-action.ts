import { blast } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class BlastCardAction extends CardAction<'blast'> {
  async executeImpl() {
    const modifier = blast({ source: this.card });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

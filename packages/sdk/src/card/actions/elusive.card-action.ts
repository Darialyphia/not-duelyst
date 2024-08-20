import { elusive, ephemeral } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class ElusiveCardAction extends CardAction<'elusive'> {
  async executeImpl() {
    const modifier = elusive({ source: this.card });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

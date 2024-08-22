import { fearsome } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class FearsomeCardAction extends CardAction<'fearsome'> {
  async executeImpl() {
    const modifier = fearsome({ source: this.card });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

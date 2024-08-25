import { barrier } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class BarrierCardAction extends CardAction<'barrier'> {
  async executeImpl() {
    const modifier = barrier({ source: this.card });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

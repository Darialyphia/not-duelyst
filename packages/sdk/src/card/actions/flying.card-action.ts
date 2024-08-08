import { flying } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class FlyingCardAction extends CardAction<'flying'> {
  async executeImpl() {
    const modifier = flying({ source: this.card });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

import { backstab } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class BackstabCardAction extends CardAction<'backstab'> {
  async executeImpl() {
    const attackBonus = this.getAmount(this.action.params.amount);
    const modifier = backstab({ source: this.card, attackBonus });
    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

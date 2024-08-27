import { tough } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class ToughCardAction extends CardAction<'tough'> {
  async executeImpl() {
    const modifier = tough({
      source: this.card,
      stacks: this.getAmount(this.action.params.stacks)
    });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

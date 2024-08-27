import { vulnerable } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class VulnerableCardAction extends CardAction<'vulnerable'> {
  async executeImpl() {
    const modifier = vulnerable({
      source: this.card,
      stacks: this.getAmount(this.action.params.stacks)
    });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

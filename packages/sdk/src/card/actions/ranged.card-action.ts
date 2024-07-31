import { ranged } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class RangedCardAction extends CardAction<'ranged'> {
  protected async executeImpl() {
    const modifier = ranged({ source: this.card });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

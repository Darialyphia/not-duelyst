import { grow } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class GrowCardAction extends CardAction<'grow'> {
  protected async executeImpl() {
    const modifier = grow({ source: this.card });

    return this.applyModifierConditionally(modifier, { candidates: [] });
  }
}

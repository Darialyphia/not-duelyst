import { provoke } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class CelerityCardAction extends CardAction<'celerity'> {
  protected executeImpl() {
    const modifier = provoke({ source: this.card });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

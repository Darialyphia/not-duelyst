import { celerity } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class ProvokeCardAction extends CardAction<'provoke'> {
  protected executeImpl() {
    const modifier = celerity({ source: this.card });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

import { frenzy } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class FrenzyCardAction extends CardAction<'frenzy'> {
  async executeImpl() {
    const modifier = frenzy({ source: this.card });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

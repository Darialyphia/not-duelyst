import { rebirth } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class RebirthCardAction extends CardAction<'rebirth'> {
  async executeImpl() {
    const modifier = rebirth({ source: this.card });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

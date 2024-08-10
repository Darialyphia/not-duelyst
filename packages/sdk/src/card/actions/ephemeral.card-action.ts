import { ephemeral } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class EphemeralCardAction extends CardAction<'ephemeral'> {
  async executeImpl() {
    const modifier = ephemeral({ source: this.card });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

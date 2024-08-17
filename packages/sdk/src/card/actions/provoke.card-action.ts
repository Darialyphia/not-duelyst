import { provoke } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class ProvokeCardAction extends CardAction<'provoke'> {
  protected async executeImpl() {
    const modifier = provoke({ source: this.card, provoker: this.ctx.entity });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

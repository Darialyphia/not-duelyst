import { rush } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class RushCardAction extends CardAction<'rush'> {
  protected async executeImpl() {
    const modifier = rush();

    this.card.addModifier(modifier);

    return () => {
      this.card.removeModifier(modifier.id);
    };
  }
}

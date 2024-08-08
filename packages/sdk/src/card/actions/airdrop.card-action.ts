import { airdrop } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class AirdropCardAction extends CardAction<'airdrop'> {
  protected async executeImpl() {
    const modifier = airdrop();

    this.card.addModifier(modifier);

    return () => {
      this.card.removeModifier(modifier.id);
    };
  }
}

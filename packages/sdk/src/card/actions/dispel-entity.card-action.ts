import { dispelEntity } from '../../modifier/modifier-utils';
import { CardAction, noop } from './_card-action';

export class DispelEntityCardAction extends CardAction<'dispel_entity'> {
  protected async executeImpl() {
    this.getUnits(this.action.params.unit).forEach(unit => {
      console.log(unit);
      dispelEntity(unit);
    });

    return noop;
  }
}

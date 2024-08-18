import { CardAction, noop } from './_card-action';

export class CleanseEntityCardAction extends CardAction<'cleanse_entity'> {
  protected async executeImpl() {
    this.getUnits(this.action.params.unit).forEach(unit => {
      unit.cleanse();
    });

    return noop;
  }
}

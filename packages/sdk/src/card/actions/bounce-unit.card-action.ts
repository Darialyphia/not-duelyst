import { CardAction, noop } from './_card-action';

export class BounceUnitCardAction extends CardAction<'bounce_unit'> {
  protected executeImpl() {
    this.getUnits(this.action.params.targets).forEach(unit => {
      unit.bounce();
    });

    return noop;
  }
}

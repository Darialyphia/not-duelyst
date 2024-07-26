import { CardAction, noop } from './_card-action';

export class DestroyUnitCardAction extends CardAction<'destroy_unit'> {
  protected executeImpl() {
    this.getUnits(this.action.params.targets).forEach(unit => {
      unit.destroy();
    });

    return noop;
  }
}

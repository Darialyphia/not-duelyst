import { CardAction, noop } from './_card-action';

export class ActivateUnitCardAction extends CardAction<'activate_unit'> {
  protected executeImpl(): () => void {
    const units = this.getUnits(this.action.params.targets);

    units.forEach(unit => unit.activate());

    return noop;
  }
}

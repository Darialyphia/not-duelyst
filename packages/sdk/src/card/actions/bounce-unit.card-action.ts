import { CardAction, noop } from './_card-action';

export class BounceUnitCardAction extends CardAction<'bounce_unit'> {
  protected async executeImpl() {
    await Promise.all(
      this.getUnits(this.action.params.targets).map(unit => unit.bounce())
    );

    return noop;
  }
}

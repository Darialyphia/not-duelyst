import { CardAction, noop } from './_card-action';

export class TransformUnitCardAction extends CardAction<'transform_unit'> {
  protected async executeImpl() {
    const [blueprintId] = this.action.params.blueprint;
    await Promise.all(
      this.getUnits(this.action.params.unit).map(unit => unit.transform(blueprintId))
    );

    return noop;
  }
}

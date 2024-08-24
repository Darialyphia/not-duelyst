import { CardAction, noop } from './_card-action';

export class DestroyUnitCardAction extends CardAction<'destroy_unit'> {
  protected async executeImpl() {
    await Promise.all(
      this.getUnits(this.action.params.targets).map(async unit => {
        await unit.destroy(this.card);
      })
    );

    return noop;
  }
}

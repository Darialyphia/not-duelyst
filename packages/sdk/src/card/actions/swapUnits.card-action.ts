import { CardAction, noop } from './_card-action';

export class SwapUnitsCardAction extends CardAction<'swap_units'> {
  protected async executeImpl() {
    const [unit1] = this.getUnits(this.action.params.unit1);
    const [unit2] = this.getUnits(this.action.params.unit2);

    if (!unit1 || !unit2) return noop;

    const cell1 = this.session.boardSystem.getCellAt(unit1.position)!;
    const cell2 = this.session.boardSystem.getCellAt(unit2.position)!;

    await Promise.all([
      unit1.teleport(cell2, { ignoreCollisions: true }),
      unit2.teleport(cell1, { ignoreCollisions: true })
    ]);

    return noop;
  }
}

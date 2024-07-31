import { CardAction, noop } from './_card-action';

export class TeleportCardAction extends CardAction<'teleport_unit'> {
  protected async executeImpl() {
    await Promise.all(
      this.getUnits(this.action.params.unit).map(async unit => {
        const [cell] = this.getCells(this.action.params.cell);
        if (!cell) return;
        await unit.teleport(cell);
      })
    );

    return noop;
  }
}

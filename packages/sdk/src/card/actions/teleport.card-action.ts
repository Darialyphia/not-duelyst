import { CardAction, noop } from './_card-action';

export class TeleportCardAction extends CardAction<'teleport_unit'> {
  protected executeImpl() {
    this.getUnits(this.action.params.unit).forEach(unit => {
      const [cell] = this.getCells(this.action.params.cell);
      if (!cell) return;
      unit.teleport(cell);
    });

    return noop;
  }
}

import { dispelCell } from '../../modifier/modifier-utils';
import { CardAction, noop } from './_card-action';

export class DispelCellCardAction extends CardAction<'dispel_cell'> {
  protected async executeImpl() {
    const cells = this.getCells(this.action.params.cells);

    cells.forEach(cell => {
      dispelCell(cell);
    });

    return noop;
  }
}

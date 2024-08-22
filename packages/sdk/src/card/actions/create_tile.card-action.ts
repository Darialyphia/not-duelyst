import { CardAction, noop } from './_card-action';

export class CreateTileCardAction extends CardAction<'create_tile'> {
  protected async executeImpl() {
    const [player] = this.getPlayers(this.action.params.player);
    this.getCells(this.action.params.position).forEach(cell => {
      cell.addTile(this.action.params.tile, player.id);
    });

    return noop;
  }
}

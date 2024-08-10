import { CardAction, noop } from './_card-action';

export class SummonUnitCardAction extends CardAction<'summon_unit'> {
  protected async executeImpl() {
    const [player] = this.getPlayers(this.action.params.player);

    const cells = this.getCells(this.action.params.position);

    await Promise.all(
      cells.map(cell => {
        if (!cell.canSummonAt) return;
        const card = player.generateCard({
          blueprintId: this.action.params.blueprint,
          pedestalId: this.card.pedestalId,
          cardBackId: this.card.cardBackId
        });

        return card.play({ position: cell, targets: [] });
      })
    );

    return noop;
  }
}

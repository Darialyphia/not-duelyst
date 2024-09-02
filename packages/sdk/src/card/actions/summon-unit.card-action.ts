import type { Point3D } from '@game/shared';
import { CardAction, noop } from './_card-action';

export class SummonUnitCardAction extends CardAction<'summon_unit'> {
  protected async executeImpl() {
    const [player] = this.getPlayers(this.action.params.player);

    const cells = this.getCells(this.action.params.position);
    const doSummon = (position: Point3D) => {
      const card = player.generateCard({
        blueprintId: this.getBlueprint(this.action.params.blueprint),
        pedestalId: this.card.pedestalId,
        cardBackId: this.card.cardBackId
      });
      return card.play({ position, targets: [], choice: 0 });
    };
    await Promise.all(
      cells.map(cell => {
        if (!cell.canSummonAt) {
          // Try to summon after the scheduler has been flushed
          // This can happen if we try to summon a unit during q dying wish since it takes place on before_destroyed, ie: jaxi, fenrir...
          return this.ctx.session.actionSystem.schedule(async () => {
            if (!cell.canSummonAt) return;
            await doSummon(cell);
          });
        }

        return doSummon(cell);
      })
    );

    return noop;
  }
}

import { spawn } from '../../modifier/modifier-utils';
import { CardAction } from './_card-action';

export class SpawnCardAction extends CardAction<'spawn'> {
  async executeImpl() {
    const [position] = this.getCells(this.action.params.position);
    const modifier = spawn({
      source: this.card,
      blueprintId: this.getBlueprint(this.action.params.blueprint),
      position
    });

    if (!this.ctx.card.meta) this.ctx.card.meta = {};

    this.ctx.card.meta.spawnPosition = position.position;

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}

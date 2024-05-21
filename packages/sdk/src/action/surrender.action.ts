import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema;

export class SurrenderAction extends GameAction<typeof schema> {
  readonly name = 'surrender';
  protected readonly allowDuringEnemyTurn = true;

  protected payloadSchema = schema;

  async impl() {
    console.log(this.player.entities.map(e => e.card.blueprintId));
    this.player.general.destroy();
  }
}

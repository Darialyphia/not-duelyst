import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema;

export class SurrenderAction extends GameAction<typeof schema> {
  readonly name = 'surrender';
  protected readonly allowDuringEnemyTurn = true;

  protected payloadSchema = schema;

  async impl() {
    this.player.general.destroy();
  }
}

import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema;

export class DrawAction extends GameAction<typeof schema> {
  readonly name = 'draw';

  protected payloadSchema = schema;

  async impl() {
    if (!this.player.canPerformResourceAction) {
      return this.printError('Cannot draw more cards this turn.');
    }
    this.player.draw(1, true);
  }
}

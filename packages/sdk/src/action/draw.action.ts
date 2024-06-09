import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema;

export class DrawAction extends GameAction<typeof schema> {
  readonly name = 'draw';

  protected payloadSchema = schema;

  async impl() {
    if (!this.player.canPerformResourceAction) {
      this.player.draw(1, true);
    }
  }
}

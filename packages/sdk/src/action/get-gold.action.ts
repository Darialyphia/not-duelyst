import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema;

export class GetGoldAction extends GameAction<typeof schema> {
  readonly name = 'getGold';

  protected payloadSchema = schema;

  async impl() {
    if (!this.player.canPerformResourceAction) {
      return this.printError('Cannot get more gold this turn.');
    }
    this.player.giveGold(1, true);
  }
}

import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema;

export class EndTurnAction extends GameAction<typeof schema> {
  readonly name = 'endTurn';

  protected payloadSchema = schema;

  async impl() {
    this.session.playerSystem.switchActivePlayer();
  }
}

import { GAME_PHASES } from '../game-session';
import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema;

export class EndTurnAction extends GameAction<typeof schema> {
  readonly name = 'endTurn';
  readonly phase = GAME_PHASES.BATTLE;

  protected payloadSchema = schema;

  async impl() {
    await this.session.playerSystem.switchActivePlayer();
  }
}

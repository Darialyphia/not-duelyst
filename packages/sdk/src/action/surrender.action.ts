import { GAME_PHASES } from '../game-session';
import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema;

export class SurrenderAction extends GameAction<typeof schema> {
  readonly name = 'surrender';
  readonly phase = GAME_PHASES.BATTLE;

  protected override readonly allowDuringEnemyTurn = true;

  protected payloadSchema = schema;

  async impl() {
    await this.player.general.destroy();
  }
}

import { z } from 'zod';
import { GAME_PHASES } from '../game-session';
import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema.extend({
  cardIndices: z.number().nonnegative().array()
});

export class MulliganAction extends GameAction<typeof schema> {
  readonly name = 'mulligan';
  readonly phase = GAME_PHASES.MULLIGAN;
  protected allowDuringEnemyTurn = true;

  protected payloadSchema = schema;

  async impl() {
    if (this.player.hasMulliganed) return;
    for (const index of this.payload.cardIndices) {
      await this.player.replaceCard(index);
    }

    this.player.hasMulliganed = true;

    const shouldSwitchToBattlePhase = this.session.playerSystem
      .getList()
      .every(player => player.hasMulliganed);

    if (shouldSwitchToBattlePhase) {
      this.session.phase = GAME_PHASES.BATTLE;
    }
  }
}

import type { FXSystem } from './fx-system';
import {
  GameSession,
  type GameFormat,
  type SerializedGameState,
  type SessionLogger
} from './game-session';
import { ClientRngSystem } from './rng-system';
import { CARDS } from './card/card-lookup';
import type { SerializedAction } from './action/action';

const clientLogger: SessionLogger = () => void 0;
// console.log(`[CLIENT_SESSION] - ${message}`, ...args);

export class ClientSession extends GameSession {
  override logger = (...args: any[]) => args;

  static create(
    state: SerializedGameState,
    options: { fxSystem: FXSystem; format: GameFormat; winnerId?: string }
  ) {
    const rngSystem = new ClientRngSystem();
    rngSystem.values = state.rng.values;

    const session = new ClientSession(state, rngSystem, options.fxSystem, clientLogger, {
      winnerId: options.winnerId,
      format: {
        config: options.format.config,
        cards: { ...CARDS, ...options.format.cards }
      }
    });

    const rng = new ClientRngSystem();
    rng.values = [...state.rng.values];

    return session;
  }

  override async dispatch(
    action: SerializedAction,
    meta: { rngValues: number[] } = { rngValues: [] }
  ) {
    try {
      this.rngSystem.values = meta.rngValues;

      return super.dispatch(action);
    } catch (err) {
      console.error(err);
    }
  }
}

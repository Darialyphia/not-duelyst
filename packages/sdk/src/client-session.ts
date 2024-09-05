import {
  GameSession,
  type GameFormat,
  type SerializedGameState,
  type SessionLogger
} from './game-session';
import { ClientRngSystem } from './rng-system';
import { CARDS } from './card/card-lookup';
import type { SerializedAction } from './action/action';
import { ClientFxSystem } from './fx-system';

const clientLogger: SessionLogger = () => void 0;
// console.log(`[CLIENT_SESSION] - ${message}`, ...args);

export class ClientSession extends GameSession {
  override logger = (...args: any[]) => args;

  static create(
    state: SerializedGameState,
    options: { format: GameFormat; winnerId?: string }
  ) {
    const rngSystem = new ClientRngSystem();
    rngSystem.values = state.rng.values;

    const session = new ClientSession(
      state,
      rngSystem,
      new ClientFxSystem(),
      clientLogger,
      {
        winnerId: options.winnerId,
        format: {
          config: options.format.config,
          map: options.format.map,
          cards: { ...CARDS, ...options.format.cards }
        }
      }
    );

    const rng = new ClientRngSystem();
    rng.values = [...state.rng.values];

    return session;
  }

  override async dispatch(
    action: SerializedAction,
    meta: { rngValues: number[] } = { rngValues: [] }
  ) {
    try {
      this.rngSystem.values.push(...meta.rngValues);

      return super.dispatch(action);
    } catch (err) {
      console.error(err);
    }
  }

  simulateAction(action: SerializedAction) {
    const rngSystem = new ClientRngSystem();
    rngSystem.values = this.rngSystem.values;

    return this.runSimulation(
      action,
      new GameSession(
        { ...this.initialState, history: this.actionSystem.serialize() },
        rngSystem,
        this.fxSystem,
        () => void 0,
        {
          format: this.format,
          parsedBlueprints: this.cardBlueprints
        }
      )
    );
  }
}

import { noopFXContext } from './fx-system';
import {
  GameSession,
  type GameFormat,
  type SerializedGameState,
  type StarEvent
} from './game-session';
import type { SerializedAction } from './action/action';
import { ServerRngSystem } from './rng-system';
import { CARDS } from './card/card-lookup';

export class ServerSession extends GameSession {
  eventsSinceLastDispatch: StarEvent[] = [];

  static create(
    state: SerializedGameState,
    options: { seed: string; format: GameFormat }
  ) {
    return new ServerSession(state, new ServerRngSystem(options.seed), noopFXContext, {
      format: {
        config: options.format.config,
        cards: { ...CARDS, ...options.format.cards }
      }
    });
  }

  setup() {
    super.setup();
    this.eventsSinceLastDispatch = [];
    this.on('*', e => {
      this.eventsSinceLastDispatch.push(e);
    });
  }

  onUpdate(
    cb: (
      action: SerializedAction,
      opts: { events: StarEvent[]; rngValues: number[] }
    ) => void
  ) {
    this.on('scheduler:flushed', () => {
      cb(this.actionSystem.getHistory().at(-1)!.serialize(), {
        events: this.eventsSinceLastDispatch,
        rngValues: this.rngSystem.values
      });
    });
  }

  dispatch(action: SerializedAction) {
    this.eventsSinceLastDispatch = [];
    super.dispatch(action);
  }
}

import { type MaybePromise } from '@game/shared';
import type { FXSystem } from './fx-system';
import {
  GameSession,
  type GameEvent,
  type GameFormat,
  type SerializedGameState,
  type StarEvent
} from './game-session';
import type { SerializedAction } from './action/action';
import { ClientRngSystem } from './rng-system';
import { CARDS } from './card/card-lookup';

type EventCallback = {
  pre: (event: StarEvent, index: number, otherEvents: StarEvent[]) => MaybePromise<void>;
  post: (event: StarEvent, index: number, otherEvents: StarEvent[]) => void;
};

export class ClientSession extends GameSession {
  override logger = (...args: any[]) => args;

  ghostSession!: GameSession;

  static create(
    state: SerializedGameState,
    options: { fxSystem: FXSystem; format: GameFormat; winnerId?: string }
  ) {
    const rngSystem = new ClientRngSystem();
    rngSystem.values = state.rng.values;

    const session = new ClientSession(state, rngSystem, options.fxSystem, {
      winnerId: options.winnerId,
      format: {
        config: options.format.config,
        cards: { ...CARDS, ...options.format.cards }
      }
    });

    const rng = new ClientRngSystem();
    rng.values = [...state.rng.values];

    session.ghostSession = new GameSession(state, rng, options.fxSystem, {
      winnerId: options.winnerId,
      format: {
        config: options.format.config,
        cards: { ...CARDS, ...options.format.cards }
      }
    });
    session.eventsSinceLastDispatch = [];
    session.ghostSession.on('*', e => {
      session.eventsSinceLastDispatch.push(e);
    });

    return session;
  }

  eventsSinceLastDispatch: StarEvent[] = [];

  private eventCallbacksMap: Map<GameEvent, EventCallback[]> = new Map();

  onAsyncDispatch(name: GameEvent, cb: EventCallback) {
    if (!this.eventCallbacksMap.has(name)) {
      this.eventCallbacksMap.set(name, []);
    }

    const events = this.eventCallbacksMap.get(name)!;
    events.push(cb);

    return () => {
      events!.splice(events.indexOf(cb), 1);
    };
  }

  private async handlePreEventCallbacks(events: StarEvent[]) {
    for (const [index, event] of events.entries()) {
      const callbacks = this.eventCallbacksMap.get(event.eventName) ?? [];
      await Promise.all(callbacks.map(cb => cb.pre(event, index, events)));
      callbacks.forEach(cb => cb.post(event, index, events));
    }
  }

  // private handlePostEventCallbacks(events: StarEvent[]) {
  //   for (const [index, event] of events.entries()) {
  //     const callbacks = this.eventCallbacksMap.get(event.eventName) ?? [];
  //     callbacks.forEach(cb => cb.post(event, index, events));
  //   }
  // }

  override async dispatch(
    action: SerializedAction,
    meta: { rngValues: number[] } = { rngValues: [] }
  ) {
    try {
      this.eventsSinceLastDispatch = [];
      this.rngSystem.values = meta.rngValues;
      this.ghostSession.rngSystem.values = meta.rngValues;

      return super.dispatch(action);
      // await this.ghostSession.dispatch(action);
      // return this.handlePreEventCallbacks(this.eventsSinceLastDispatch).then(() => {
      // });
    } catch (err) {
      console.error(err);
    }
  }
}

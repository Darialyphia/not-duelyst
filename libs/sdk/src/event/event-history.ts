import { exhaustiveSwitch } from '@hc/shared';
import { EVENT_NAME, GameEvent, SerializedEvent } from './event';
import { MoveEvent } from './move.event';
import { GameContext } from '../game';

export class EventHistory {
  private history: GameEvent<any>[] = [];

  constructor(rawHistory: SerializedEvent<any>[], ctx: GameContext) {
    rawHistory
      .map(event => {
        switch (event.type) {
          case EVENT_NAME.MOVE:
            return new MoveEvent(event.payload);
          default:
            throw new Error(`Unknown event type: ${event.type}`);
        }
      })
      .forEach(event => {
        event.execute(ctx);
      });
  }

  add(event: GameEvent<any>) {
    this.history.push(event);
  }

  get() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(event => event.serialize());
  }
}

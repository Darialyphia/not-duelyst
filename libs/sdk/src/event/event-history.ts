import { exhaustiveSwitch } from '@hc/shared';
import { EVENT_NAME, GameEvent, SerializedEvent } from './event';
import { MoveEvent } from './move.event';
import { GameContext } from '../game';
import { EndTurnEvent } from './end-turn.event';

export class EventHistory {
  private history: GameEvent<any>[] = [];

  constructor(private ctx: GameContext) {}

  setup(rawHistory: SerializedEvent<any>[]) {
    rawHistory
      .map(event => {
        switch (event.type) {
          case EVENT_NAME.MOVE:
            return new MoveEvent(event.payload);
          case EVENT_NAME.END_TURN:
            return new EndTurnEvent(event.payload);
          default:
            exhaustiveSwitch(event.type);
            throw new Error(`Unknown event type: ${event.type}`);
        }
      })
      .forEach(event => {
        event.execute(this.ctx);
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

import { EventName, GameEvent, SerializedEvent, eventMap } from './event';
import { GameContext } from '../game';
import { Serializable } from '../utils/interfaces';

export class EventHistory implements Serializable {
  private history: GameEvent<EventName, any>[] = [];

  constructor(private ctx: GameContext) {}

  setup(rawHistory: SerializedEvent[]) {
    rawHistory.forEach(({ type, payload }) => {
      const event = eventMap[type];

      new event(payload as any, this.ctx).execute();
    });
  }

  add(event: GameEvent<EventName, any>) {
    this.history.push(event);
    this.ctx.emitter.emit('history:update', event.serialize());
  }

  get() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(event => event.serialize());
  }
}

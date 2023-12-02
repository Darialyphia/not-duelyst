import { GameEvent } from './event';
import { GameContext } from '../game';
import { Serializable } from '../utils/interfaces';
import { EventReducer, SerializedEvent } from './event-reducer';

export class EventHistory implements Serializable {
  private history: GameEvent<any>[] = [];

  constructor(private ctx: GameContext) {}

  setup(rawHistory: SerializedEvent[]) {
    const reducer = new EventReducer(this.ctx);

    rawHistory.forEach(reducer.reduce);
  }

  add(event: GameEvent<any>) {
    this.history.push(event);
    this.ctx.emitter.emit('history:update', event.serialize() as SerializedEvent);
  }

  get() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(event => event.serialize()) as SerializedEvent[];
  }
}

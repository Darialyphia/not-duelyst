import { GameEvent, SerializedEvent, eventMap } from './event';
import { GameContext } from '../game';
import { Serializable } from '../utils/interfaces';

export class EventHistory implements Serializable {
  private history: GameEvent<any>[] = [];

  constructor(private ctx: GameContext) {}

  setup(rawHistory: SerializedEvent[]) {
    rawHistory.forEach(({ type, payload }: SerializedEvent) => {
      const event = eventMap[type];

      new event(payload as any, this.ctx).execute();
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

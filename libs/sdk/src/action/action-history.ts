import { GameAction } from './action';
import { GameSession } from '../game-session';
import { Serializable } from '../utils/interfaces';
import { SerializedAction } from './action-deserializer';

export class ActionHistory implements Serializable {
  private history: GameAction<any>[] = [];

  constructor(private ctx: GameSession) {}

  setup(rawHistory: SerializedAction[]) {
    rawHistory.forEach(this.ctx.actionQueue.push);
  }

  add(action: GameAction<any>) {
    this.history.push(action);
  }

  get() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(event => event.serialize()) as SerializedAction[];
  }
}

import { GameAction } from './action';
import { GameSession } from '../game-session';
import { Serializable } from '../utils/interfaces';
import { ActionReducer, SerializedAction } from './action-reducer';

export class ActionHistory implements Serializable {
  private history: GameAction<any>[] = [];

  constructor(private ctx: GameSession) {}

  setup(rawHistory: SerializedAction[]) {
    const reducer = new ActionReducer(this.ctx);

    rawHistory.forEach(reducer.reduce);
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

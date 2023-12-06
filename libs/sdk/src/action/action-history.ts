import { GameAction } from './action';
import { GameContext } from '../game-session';
import { Serializable } from '../utils/interfaces';
import { ActionReducer, SerializedAction } from './action-reducer';

export class ActionHistory implements Serializable {
  private history: GameAction<any>[] = [];

  constructor(private ctx: GameContext) {}

  setup(rawHistory: SerializedAction[]) {
    const reducer = new ActionReducer(this.ctx);

    rawHistory.forEach(reducer.reduce);
  }

  add(action: GameAction<any>) {
    this.history.push(action);
    this.ctx.emitter.emit('history:update', action.serialize() as SerializedAction);
  }

  get() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(event => event.serialize()) as SerializedAction[];
  }
}

import { JSONValue } from '@hc/shared';
import { Serializable } from '../utils/interfaces';
import { GameSession } from '../game-session';
import { SerializedAction } from './action-reducer';

export abstract class GameAction<TPayload extends JSONValue> implements Serializable {
  abstract readonly name: string;
  readonly isSideEffect: boolean;

  constructor(
    public payload: TPayload,
    protected ctx: GameSession
  ) {
    this.isSideEffect = this.ctx.isExecutingAction;
  }

  protected abstract impl(): void;

  execute() {
    // prevents actions from runnig ntwice on the client: when they are received from the server, and when the action is executed client side
    if (!this.ctx.isAuthoritative && this.isSideEffect) {
      return;
    }
    this.ctx.isExecutingAction = true;
    this.ctx.history.add(this);
    this.impl();
    this.ctx.emitter.emit('game:event', this.serialize() as unknown as SerializedAction); // smh

    if (!this.isSideEffect) {
      this.ctx.isExecutingAction = false;
    }
    return this;
  }

  serialize() {
    return { type: this.name, payload: this.payload };
  }
}

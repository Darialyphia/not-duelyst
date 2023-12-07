import { JSONValue } from '@hc/shared';
import { Serializable } from '../utils/interfaces';
import { GameSession } from '../game-session';
import { SerializedAction } from './action-deserializer';

export abstract class GameAction<TPayload extends JSONValue> implements Serializable {
  abstract readonly name: string;
  // readonly isSideEffect: boolean;

  constructor(
    public payload: TPayload,
    protected ctx: GameSession
  ) {
    // this.isSideEffect = this.ctx.isExecutingAction;
  }

  protected abstract impl(): void;

  execute() {
    this.ctx.history.add(this);
    this.impl();
    this.ctx.emitter.emit('game:event', this.serialize() as unknown as SerializedAction); // smh
  }

  serialize() {
    return { type: this.name, payload: this.payload };
  }
}

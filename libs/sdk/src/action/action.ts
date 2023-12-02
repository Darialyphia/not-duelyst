import { JSONValue } from '@hc/shared';
import { GameContext } from '../game-session';
import { Serializable } from '../utils/interfaces';

import { SerializedAction } from './action-reducer';

export abstract class GameAction<TPayload extends JSONValue> implements Serializable {
  abstract readonly name: string;

  constructor(
    public payload: TPayload,
    protected ctx: GameContext
  ) {}

  protected abstract impl(): void;

  execute() {
    this.impl();
    this.ctx.emitter.emit('game:event', this.serialize() as unknown as SerializedAction);

    return this;
  }

  serialize() {
    return { type: this.name, payload: this.payload };
  }
}

import { JSONValue } from '@hc/shared';
import { GameContext } from '../game';
import { Serializable } from '../utils/interfaces';

import { SerializedEvent } from './event-reducer';

export abstract class GameEvent<TPayload extends JSONValue> implements Serializable {
  abstract readonly name: string;

  constructor(
    public payload: TPayload,
    protected ctx: GameContext
  ) {}

  protected abstract impl(): void;

  execute() {
    this.impl();
    this.ctx.emitter.emit('game:event', this.serialize() as unknown as SerializedEvent);

    return this;
  }

  serialize() {
    return { type: this.name, payload: this.payload };
  }
}

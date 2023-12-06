import { JSONValue } from '@hc/shared';
import { Serializable } from '../utils/interfaces';
import { GameSession } from '../game-session';

export abstract class GameAction<TPayload extends JSONValue> implements Serializable {
  abstract readonly name: string;

  constructor(
    public payload: TPayload,
    protected ctx: GameSession
  ) {}

  protected abstract impl(): void;

  execute() {
    this.impl();
    this.ctx.history.add(this);

    return this;
  }

  serialize() {
    return { type: this.name, payload: this.payload };
  }
}

import { Values } from '@hc/shared';
import { GameContext } from '../game';

export const EVENT_NAME = {
  MOVE: 'MOVE'
} as const;

export type EventName = Values<typeof EVENT_NAME>;

export type SerializedEvent<T> = {
  type: EventName;
  payload: T;
};

export abstract class GameEvent<TPayload> {
  protected abstract name: EventName;

  constructor(protected payload: TPayload) {}

  protected abstract impl(ctx: GameContext): void;

  execute(ctx: GameContext) {
    this.impl(ctx);
    ctx.history.add(this);
  }

  serialize(): SerializedEvent<TPayload> {
    return { type: this.name, payload: this.payload };
  }
}

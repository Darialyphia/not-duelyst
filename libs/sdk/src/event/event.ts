import { JSONValue, Values } from '@hc/shared';
import { GameContext } from '../game';

export const EVENT_NAME = {
  MOVE: 'MOVE',
  END_TURN: 'END_TURN',
  SUMMON_FROM_LOADOUT: 'SUMMON_FROM_LOADOUT',
  USE_SKILL: 'USE_SKILL'
} as const;

export type EventName = Values<typeof EVENT_NAME>;

export type SerializedEvent<T> = {
  type: EventName;
  payload: T;
};

export abstract class GameEvent<TPayload extends JSONValue> {
  protected abstract name: EventName;

  constructor(
    protected payload: TPayload,
    protected ctx: GameContext
  ) {}

  protected abstract impl(): void;

  execute() {
    this.impl();
    return this;
  }

  serialize(): SerializedEvent<TPayload> {
    return { type: this.name, payload: this.payload };
  }
}

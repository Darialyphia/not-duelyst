import { Constructor, JSONValue, Values } from '@hc/shared';
import { GameContext } from '../game';
import { Serializable } from '../utils/interfaces';
import { DealDamageEvent } from './deal-damage.event';
import { EndTurnEvent } from './end-turn.event';
import { MoveEvent } from './move.event';
import { SummonFromLoadoutEvent } from './summon-from-loadout.event';
import { UseSkillEvent } from './use-sklll.event';

export const EVENT_NAME = {
  MOVE: 'MOVE',
  END_TURN: 'END_TURN',
  SUMMON_FROM_LOADOUT: 'SUMMON_FROM_LOADOUT',
  USE_SKILL: 'USE_SKILL',
  DEAL_DAMAGE: 'DEAL_DAMAGE'
} as const;
export type EventName = Values<typeof EVENT_NAME>;

export const eventMap = {
  [EVENT_NAME.END_TURN]: EndTurnEvent,
  [EVENT_NAME.MOVE]: MoveEvent,
  [EVENT_NAME.SUMMON_FROM_LOADOUT]: SummonFromLoadoutEvent,
  [EVENT_NAME.USE_SKILL]: UseSkillEvent,
  [EVENT_NAME.DEAL_DAMAGE]: DealDamageEvent
} as const satisfies Record<EventName, Constructor<GameEvent<any>>>;

export type EventMap = typeof eventMap;

type SerializedEventMap = {
  [Key in keyof EventMap]: {
    type: Key;
    payload: ReturnType<InstanceType<EventMap[Key]>['serialize']>;
  };
};

export type SerializedEvent = Values<SerializedEventMap>;

export abstract class GameEvent<TPayload extends JSONValue> implements Serializable {
  abstract readonly name: EventName;

  constructor(
    protected payload: TPayload,
    protected ctx: GameContext
  ) {}

  protected abstract impl(): void;

  execute() {
    this.impl();
    return this;
  }

  serialize() {
    return { type: this.name, payload: this.payload };
  }
}

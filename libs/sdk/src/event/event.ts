import { JSONValue, Values } from '@hc/shared';
import { GameContext } from '../game';
import { Serializable } from '../utils/interfaces';
import { DealDamageEvent } from './deal-damage.event';
import { EndTurnEvent } from './end-turn.event';
import { MoveEvent } from './move.event';
import { SummonFromLoadoutEvent } from './summon-from-loadout.event';
import { UseSkillEvent } from './use-sklll.event';

export type EventName = keyof typeof eventMap;

export const eventMap = {
  END_TURN: EndTurnEvent,
  MOVE: MoveEvent,
  SUMMON_FROM_LOADOUT: SummonFromLoadoutEvent,
  USE_SKILL: UseSkillEvent,
  DEAL_DAMAGE: DealDamageEvent
} as const;

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
    this.ctx.emitter.emit('game:event', this.serialize());

    return this;
  }

  serialize(): SerializedEvent {
    return { type: this.name, payload: this.payload } as SerializedEvent;
  }
}

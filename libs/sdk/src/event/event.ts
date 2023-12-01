import { JSONValue, Values } from '@hc/shared';
import { GameContext } from '../game';
import { Serializable } from '../utils/interfaces';
import { DealDamageEvent } from './deal-damage.event';
import { EndTurnEvent } from './end-turn.event';
import { MoveEvent } from './move.event';
import { SummonFromLoadoutEvent } from './summon-from-loadout.event';
import { UseSkillEvent } from './use-sklll.event';

export const eventMap = {
  END_TURN: EndTurnEvent,
  MOVE: MoveEvent,
  SUMMON_FROM_LOADOUT: SummonFromLoadoutEvent,
  USE_SKILL: UseSkillEvent,
  DEAL_DAMAGE: DealDamageEvent
} as const;

export type EventName = keyof typeof eventMap;

export type SerializedEvent = ReturnType<
  InstanceType<Values<typeof eventMap>>['serialize']
>;

export abstract class GameEvent<TName extends EventName, TPayload extends JSONValue>
  implements Serializable
{
  abstract readonly name: TName;

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

import { Constructor, exhaustiveSwitch } from '@hc/shared';
import { EVENT_NAME, EventName, GameEvent, SerializedEvent } from './event';
import { MoveEvent } from './move.event';
import { GameContext } from '../game';
import { EndTurnEvent } from './end-turn.event';
import { SummonFromLoadoutEvent } from './summon-from-loadout.event';
import { Serializable } from '../utils/interfaces';
import { UseSkillEvent } from './use-sklll.event';
import { DealDamageEvent } from './deal-damage.event';

const eventDict: Record<EventName, Constructor<GameEvent<any>>> = {
  [EVENT_NAME.END_TURN]: EndTurnEvent,
  [EVENT_NAME.MOVE]: MoveEvent,
  [EVENT_NAME.SUMMON_FROM_LOADOUT]: SummonFromLoadoutEvent,
  [EVENT_NAME.USE_SKILL]: UseSkillEvent,
  [EVENT_NAME.DEAL_DAMAGE]: DealDamageEvent
};

export class EventHistory implements Serializable {
  private history: GameEvent<any>[] = [];

  constructor(private ctx: GameContext) {}

  setup(rawHistory: SerializedEvent<any>[]) {
    rawHistory.forEach(({ type, payload }: SerializedEvent<any>) => {
      const event = eventDict[type];

      new event(payload, this.ctx).execute();
    });
  }

  add(event: GameEvent<any>) {
    this.history.push(event);
  }

  get() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(event => event.serialize());
  }
}

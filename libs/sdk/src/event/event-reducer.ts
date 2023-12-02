import { Constructor, JSONValue, Values } from '@hc/shared';
import { GameEvent } from './event';
import { DealDamageEvent } from './deal-damage.event';
import { EndTurnEvent } from './end-turn.event';
import { MoveEvent } from './move.event';
import { SummonFromLoadoutEvent } from './summon-from-loadout.event';
import { UseSkillEvent } from './use-sklll.event';
import { GameContext } from '../game';

type GenericEventMap = Record<string, Constructor<GameEvent<JSONValue>>>;

type ValidatedEventMap<T extends GenericEventMap> = {
  [Name in keyof T]: T[Name] extends Constructor<GameEvent<JSONValue>>
    ? Name extends InstanceType<T[Name]>['name']
      ? T[Name]
      : never
    : never;
};

const validateEventMap = <T extends GenericEventMap>(data: ValidatedEventMap<T>) => data;

export const eventMap = validateEventMap({
  END_TURN: EndTurnEvent,
  MOVE: MoveEvent,
  SUMMON_FROM_LOADOUT: SummonFromLoadoutEvent,
  USE_SKILL: UseSkillEvent,
  DEAL_DAMAGE: DealDamageEvent
});

export type EventName = keyof typeof eventMap;

export type SerializedEvent = ReturnType<
  InstanceType<Values<typeof eventMap>>['serialize']
> & { type: keyof typeof eventMap };

export class EventReducer {
  constructor(private ctx: GameContext) {}

  reduce({ type, payload }: SerializedEvent) {
    const event = eventMap[type];

    new event(payload as any, this.ctx).execute();
  }
}

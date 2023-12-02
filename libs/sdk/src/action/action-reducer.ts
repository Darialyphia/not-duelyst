import { Constructor, JSONValue, Values } from '@hc/shared';
import { GameAction } from './action';
import { DealDamageAction } from './deal-damage.action';
import { GameContext } from '../game';
import { EndTurnAction } from './end-turn.action';
import { MoveAction } from './move.action';
import { SummonFromLoadoutAction } from './summon-from-loadout.action';
import { UseSkillAction } from './use-sklll.action';

type GenericActionMap = Record<string, Constructor<GameAction<JSONValue>>>;

type ValidatedActionMap<T extends GenericActionMap> = {
  [Name in keyof T]: T[Name] extends Constructor<GameAction<JSONValue>>
    ? Name extends InstanceType<T[Name]>['name']
      ? T[Name]
      : never
    : never;
};

const validateActionMap = <T extends GenericActionMap>(data: ValidatedActionMap<T>) =>
  data;

export const actionMap = validateActionMap({
  END_TURN: EndTurnAction,
  MOVE: MoveAction,
  SUMMON_FROM_LOADOUT: SummonFromLoadoutAction,
  USE_SKILL: UseSkillAction,
  DEAL_DAMAGE: DealDamageAction
});

export type ActionNae = keyof typeof actionMap;

export type SerializedAction = ReturnType<
  InstanceType<Values<typeof actionMap>>['serialize']
> & { type: keyof typeof actionMap };

export class ActionReducer {
  constructor(private ctx: GameContext) {}

  reduce({ type, payload }: SerializedAction) {
    const event = actionMap[type];

    new event(payload as any, this.ctx).execute();
  }
}

import { Constructor, JSONObject, JSONValue, Values } from '@hc/shared';
import { GameAction } from './action';
import { DealDamageAction } from './deal-damage.action';
import { EndTurnAction } from './end-turn.action';
import { MoveAction } from './move.action';
import { SummonFromLoadoutAction } from './summon-from-loadout.action';
import { UseSkillAction } from './use-sklll.action';
import { GameSession } from '../game-session';
import { DieAction } from './die.action';

type GenericActionMap = Record<string, Constructor<GameAction<JSONObject>>>;

type ValidatedActionMap<T extends GenericActionMap> = {
  [Name in keyof T]: T[Name] extends Constructor<GameAction<JSONObject>>
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
  DEAL_DAMAGE: DealDamageAction,
  DIE: DieAction
});

export type ActionName = keyof typeof actionMap;

export type SerializedAction = ReturnType<
  InstanceType<Values<typeof actionMap>>['serialize']
> & { type: keyof typeof actionMap };

export class ActionDeserializer {
  constructor(private ctx: GameSession) {}

  deserialize({ type, payload }: SerializedAction) {
    if (this.ctx.isAuthoritative) {
      throw new Error(
        'authoritative game session cannot receive actions. Use dispatchPlayerInput instead'
      );
    }

    const event = actionMap[type];

    return new event(payload as any, this.ctx);
  }
}

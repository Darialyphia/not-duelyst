import { Values, Constructor, JSONValue } from '@hc/shared';
import { GameContext } from '../game';
import { MoveAction } from './move.action';
import { EndTurnAction } from './end-turn.action';
import { SummonAction } from './summon.action';
import { GameAction } from './action';
import { UseSkillAction } from './use-skill.action';

export type RawAction = {
  type: ActionName;
  payload: JSONValue;
};

export const ACTION_NAME = {
  MOVE: 'MOVE',
  END_TURN: 'END_TURN',
  SUMMON: 'SUMMON',
  USE_SKILL: 'USE_SKILL'
} as const;

export type ActionName = Values<typeof ACTION_NAME>;

const actionDict: Record<ActionName, Constructor<GameAction<any>>> = {
  [ACTION_NAME.MOVE]: MoveAction,
  [ACTION_NAME.END_TURN]: EndTurnAction,
  [ACTION_NAME.SUMMON]: SummonAction,
  [ACTION_NAME.USE_SKILL]: UseSkillAction
};

export class ActionReducer {
  constructor(private ctx: GameContext) {}

  reduce({ type, payload }: RawAction) {
    const action = actionDict[type];

    new action(payload, this.ctx).execute();
  }
}

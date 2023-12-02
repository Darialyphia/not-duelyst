import { Values, Constructor, JSONValue } from '@hc/shared';
import { GameContext } from '../game';
import { MoveAction } from './move.input';
import { EndTurnAction } from './end-turn.input';
import { SummonAction } from './summon.input';
import { DefaultSchema, PlayerInput } from './input';
import { UseSkillAction } from './use-skill.input';

type GenericInputMap = Record<string, Constructor<PlayerInput<DefaultSchema>>>;

type ValidatedInputMap<T extends GenericInputMap> = {
  [Name in keyof T]: T[Name] extends Constructor<PlayerInput<DefaultSchema>>
    ? Name extends InstanceType<T[Name]>['name']
      ? T[Name]
      : never
    : never;
};

const validateInputMap = <T extends GenericInputMap>(data: ValidatedInputMap<T>) => data;

export type SerializedInput = {
  type: InputName;
  payload: JSONValue;
};

export const INPUT_NAME = {
  MOVE: 'MOVE',
  END_TURN: 'END_TURN',
  SUMMON: 'SUMMON',
  USE_SKILL: 'USE_SKILL'
} as const;

export type InputName = Values<typeof INPUT_NAME>;

const inputMap = validateInputMap({
  [INPUT_NAME.MOVE]: MoveAction,
  [INPUT_NAME.END_TURN]: EndTurnAction,
  [INPUT_NAME.SUMMON]: SummonAction,
  [INPUT_NAME.USE_SKILL]: UseSkillAction
});

export class InputReducer {
  constructor(private ctx: GameContext) {}

  reduce({ type, payload }: SerializedInput) {
    const action = inputMap[type];

    new action(payload, this.ctx).execute();
  }
}

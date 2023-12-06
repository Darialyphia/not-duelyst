import { Values, Constructor, JSONValue } from '@hc/shared';
import { MoveInput } from './move.input';
import { EndTurnInput } from './end-turn.input';
import { SummonInput } from './summon.input';
import { DefaultSchema, PlayerInput } from './input';
import { UseSkillInput } from './use-skill.input';
import { GameSession } from '../game-session';

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
  [INPUT_NAME.MOVE]: MoveInput,
  [INPUT_NAME.END_TURN]: EndTurnInput,
  [INPUT_NAME.SUMMON]: SummonInput,
  [INPUT_NAME.USE_SKILL]: UseSkillInput
});

export class InputReducer {
  constructor(private ctx: GameSession) {}

  reduce({ type, payload }: SerializedInput) {
    if (!this.ctx.isAuthoritative) {
      throw new Error(
        'Non authoritative game session cannot receive player inputs. Use dispatchAction instead'
      );
    }

    const action = inputMap[type];

    new action(payload, this.ctx).execute();
  }
}

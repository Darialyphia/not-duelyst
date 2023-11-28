import { Values, exhaustiveSwitch } from '@hc/shared';
import { GameContext } from '../game';
import { MoveAction } from './move.action';

export const ACTION_NAME = {
  MOVE: 'MOVE'
} as const;

export type ActionName = Values<typeof ACTION_NAME>;

export type RawAction = {
  type: ActionName;
  payload: unknown;
};

export class ActionReducer {
  constructor(private ctx: GameContext) {}

  reduce(action: RawAction) {
    switch (action.type) {
      case ACTION_NAME.MOVE:
        return new MoveAction(action.payload).execute(this.ctx);
      default:
        exhaustiveSwitch(action.type);
    }
  }
}

import { Values, exhaustiveSwitch } from '@hc/shared';
import { GameContext, LazyGameContext } from '../game';
import { MoveAction } from './move.action';
import { EndTurnAction } from './end-turn.action';

export const ACTION_NAME = {
  MOVE: 'MOVE',
  END_TURN: 'END_TURN'
} as const;

export type ActionName = Values<typeof ACTION_NAME>;

export type RawAction = {
  type: ActionName;
  payload: unknown;
};

export class ActionReducer {
  constructor(private getContext: LazyGameContext) {}

  reduce(action: RawAction) {
    const ctx = this.getContext();
    switch (action.type) {
      case ACTION_NAME.MOVE:
        return new MoveAction(action.payload).execute(ctx);
      case ACTION_NAME.END_TURN:
        return new EndTurnAction(action.payload).execute(ctx);
      default:
        exhaustiveSwitch(action.type);
    }
  }
}

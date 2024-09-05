import { GameAction, type DefaultSchema, type SerializedAction } from './action';
import { GameSession } from '../game-session';
import type { Constructor, Nullable, Serializable, Values } from '@game/shared';
import { AttackAction } from './attack.action';
import { EndTurnAction } from './end-turn.action';
import { MoveAction } from './move.action';
import { PlayCardAction } from './play-card.action';
import { SurrenderAction } from './surrender.action';
import { ReplaceCardAction } from './replace.action';
import { MulliganAction } from './mulligan.action';

type GenericActionMap = Record<string, Constructor<GameAction<DefaultSchema>>>;

type ValidatedActionMap<T extends GenericActionMap> = {
  [Name in keyof T]: T[Name] extends Constructor<GameAction<DefaultSchema>>
    ? Name extends InstanceType<T[Name]>['name']
      ? T[Name]
      : never
    : never;
};

const validateActionMap = <T extends GenericActionMap>(data: ValidatedActionMap<T>) =>
  data;

const actionMap = validateActionMap({
  attack: AttackAction,
  endTurn: EndTurnAction,
  move: MoveAction,
  playCard: PlayCardAction,
  surrender: SurrenderAction,
  replaceCard: ReplaceCardAction,
  mulligan: MulliganAction
});

export type GameActionName = keyof typeof actionMap;

type ScheduledAction = () => Promise<void>;
export class ActionSystem implements Serializable {
  private history: GameAction<any>[] = [];
  private isRunning = false;
  private isSilent = true;

  currentAction?: Nullable<InstanceType<Values<typeof actionMap>>> = null;

  private scheduledActions: ScheduledAction[] = [];

  constructor(private session: GameSession) {}

  async setup(rawHistory: SerializedAction[]) {
    for (const action of rawHistory) {
      await this.schedule(() => this.handleAction(action));
    }
    this.isSilent = false;
  }

  private isActionType(type: string): type is keyof typeof actionMap {
    return Object.keys(actionMap).includes(type);
  }

  async schedule(fn: ScheduledAction) {
    this.scheduledActions.push(fn);
    if (!this.isRunning) {
      await this.flushSchedule();
    }
  }

  private async flushSchedule() {
    if (this.isRunning) {
      console.warn('already flushing !');
      return;
    }
    this.isRunning = true;
    try {
      for (const fn of this.scheduledActions) {
        await fn();
      }
      this.scheduledActions = [];
      this.isRunning = false;
      if (!this.isSilent) {
        this.session.emit('scheduler:flushed');
      }
    } catch (err) {
      console.error(err);
      this.session.emit('game:error', err as Error);
    }
  }

  dispatch({ type, payload }: SerializedAction) {
    if (!this.isActionType(type)) return;
    return this.schedule(() => this.handleAction({ type, payload }));
  }

  async handleAction({ type, payload }: SerializedAction) {
    if (!this.isActionType(type)) return;
    this.session.logger(`%c[ACTION:${type}]`, 'color: blue', payload);
    const ctor = actionMap[type];
    const action = new ctor(payload, this.session);
    this.session.emit('game:action-start', action);
    this.currentAction = action;
    await action.execute();
    this.history.push(action);
    this.session.emit('game:action', action);
    this.currentAction = null;
  }

  getHistory() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(action => action.serialize());
  }
}

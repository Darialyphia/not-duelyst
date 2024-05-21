import { GameAction, type DefaultSchema, type SerializedAction } from './action';
import { GameSession } from '../game-session';
import type { Constructor, MaybePromise, Serializable } from '@game/shared';
import { AttackAction } from './attack.action';
import { EndTurnAction } from './end-turn.action';
import { MoveAction } from './move.action';
import { PlayCardAction } from './play-card.action';
import { UseSkillAction } from './use-skill.action';
import { SurrenderAction } from './surrender.action';

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
  useSkill: UseSkillAction,
  surrender: SurrenderAction
});

type ScheduledAction = () => MaybePromise<void>;
export class ActionSystem implements Serializable {
  private history: GameAction<any>[] = [];
  private isRunning = false;

  private scheduledActions: ScheduledAction[] = [];

  constructor(private session: GameSession) {}

  async setup(rawHistory: SerializedAction[]) {
    this.scheduledActions = rawHistory.map(action => () => this.handleAction(action));
    await this.flushSchedule();
  }

  private isActionType(type: string): type is keyof typeof actionMap {
    return Object.keys(actionMap).includes(type);
  }

  schedule(fn: ScheduledAction) {
    this.scheduledActions.push(fn);
    if (!this.isRunning) {
      this.flushSchedule();
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
    } catch (err) {
      this.session.emit('game:error', err as Error);
    }
  }

  dispatch({ type, payload }: SerializedAction) {
    if (!this.isActionType(type)) return;
    this.schedule(() => this.handleAction({ type, payload }));
  }

  async handleAction({ type, payload }: SerializedAction) {
    if (!this.isActionType(type)) return;
    this.isRunning = true;
    console.log(`%c[ACTION:${type}]`, 'color: blue', payload);
    const ctor = actionMap[type];
    const action = new ctor(payload, this.session);
    await action.execute();
    this.isRunning = false;
    // await this.flushSchedule();
    this.history.push(action);
    this.session.emit('game:action', action);
  }

  getHistory() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(action => action.serialize());
  }
}

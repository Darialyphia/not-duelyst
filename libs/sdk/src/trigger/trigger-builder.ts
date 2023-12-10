import { StrictBuilder } from 'builder-pattern';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { ActionName, SerializedAction } from '../action/action-deserializer';
import { GameAction } from '../action/action';

export type TriggerId = string;

export type Trigger = {
  id: TriggerId;
  duration: number;
  actionName: ActionName;
  owner: Entity;
  execute(ctx: GameSession, action: GameAction<any>, trigger: Trigger): void;
};

export const triggerBuilder = StrictBuilder<Trigger>;

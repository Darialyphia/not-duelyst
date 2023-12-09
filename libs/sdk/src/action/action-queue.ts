import { GameSession } from '../game-session';
import { GameAction } from './action';
import { ActionDeserializer, SerializedAction } from './action-deserializer';

export class ActionQueue {
  private queue: GameAction<any>[] = [];
  private deserializer: ActionDeserializer;
  private isRunning = false;

  constructor(private ctx: GameSession) {
    this.deserializer = new ActionDeserializer(this.ctx);
  }

  private async process() {
    this.isRunning = true;
    do {
      const action = this.queue.shift();

      await action?.execute();
    } while (this.queue.length);
    this.isRunning = false;
  }

  push(action: GameAction<any> | SerializedAction) {
    // prevents from running actions that are "side effects", ie triggered by other actions, on the client side
    if (!this.ctx.isAuthoritative && this.isRunning) return;

    this.queue.push(
      action instanceof GameAction ? action : this.deserializer.deserialize(action)
    );

    if (!this.isRunning) {
      this.process();
    }
  }
}

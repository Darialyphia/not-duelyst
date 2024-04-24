import { z } from 'zod';
import type { JSONValue, Serializable } from '@game/shared';
import { GameSession } from '../game-session';

export const defaultActionSchema = z.object({
  playerId: z.string()
});
export type DefaultSchema = typeof defaultActionSchema;

export type SerializedAction = {
  type: string;
  payload: JSONValue;
};

export type AnyGameAction = GameAction<any>;

export abstract class GameAction<TSchema extends DefaultSchema> implements Serializable {
  abstract readonly name: string;
  protected abstract payloadSchema: TSchema;

  protected payload!: z.infer<TSchema>;
  protected allowDuringEnemyTurn = false;

  constructor(
    protected rawPayload: JSONValue,
    protected session: GameSession
  ) {}

  protected abstract impl(): Promise<void>;

  get player() {
    const player = this.session.playerSystem.getPlayerById(this.payload.playerId);
    if (!player) throw new Error(`Unknown player id: ${this.payload.playerId}`);

    return player;
  }

  execute() {
    const parsed = this.payloadSchema.safeParse(this.rawPayload);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }
    this.payload = parsed.data;

    if (!this.player.isActive && !this.allowDuringEnemyTurn) {
      console.error('You are not the active player');
      return;
    }

    return this.impl();
  }

  serialize(): SerializedAction {
    return { type: this.name, payload: this.rawPayload };
  }
}

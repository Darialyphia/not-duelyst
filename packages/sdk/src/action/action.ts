import { z } from 'zod';
import type { JSONValue, Serializable } from '@game/shared';
import { GameSession, type GamePhase } from '../game-session';

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
  abstract readonly phase: GamePhase;
  protected abstract payloadSchema: TSchema;

  protected payload!: z.infer<TSchema>;
  protected readonly allowDuringEnemyTurn: boolean = false;

  constructor(
    protected rawPayload: JSONValue,
    protected session: GameSession
  ) {}

  protected abstract impl(): Promise<void>;

  get player() {
    return this.session.playerSystem.getPlayerById(this.payload.playerId)!;
  }

  private parsePayload() {
    const parsed = this.payloadSchema.safeParse(this.rawPayload);
    if (!parsed.success) {
      return this.printError('Wrong action payload');
    }

    this.payload = parsed.data;
  }

  async execute() {
    if (this.session.phase != this.phase) {
      return this.printError(
        `${this.name} action cannot be executed during ${this.session.phase}`
      );
    }
    this.parsePayload();

    if (!this.player) {
      return this.printError(`Unknown player id: ${this.payload.playerId}`);
    }

    if (!this.player.isActive && !this.allowDuringEnemyTurn) {
      return this.printError('You are not the active player');
    }
    return await this.impl();
  }

  protected printError(message: string) {
    this.session.logger(`%c[${this.name}]`, 'color: red', message);
  }

  serialize(): SerializedAction {
    return { type: this.name, payload: this.rawPayload };
  }
}

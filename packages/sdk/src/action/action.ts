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
      return this.printError('You are not the active player');
    }

    this.payload = parsed.data;
  }

  async execute() {
    this.parsePayload();

    if (!this.player) {
      return this.printError(`Unknown player id: ${this.payload.playerId}`);
    }

    if (!this.player.isActive && !this.allowDuringEnemyTurn) {
      console.log({
        name: this.name,
        eventPlayer: this.player.name,
        isActive: this.player.isActive,
        activePlayer: this.session.playerSystem.activePlayer.name
      });
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

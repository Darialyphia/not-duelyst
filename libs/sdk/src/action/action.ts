import { z } from 'zod';
import { GameContext } from '../game';
import { ActionName, RawAction } from './action-reducer';
import { Serializable } from '../utils/interfaces';
import { JSONValue } from '@hc/shared';

export const defaultActionSchema = z.object({
  playerId: z.string()
});
type DefaultSchema = typeof defaultActionSchema;
export abstract class GameAction<TSchema extends DefaultSchema> implements Serializable {
  protected abstract name: ActionName;

  protected abstract payloadSchema: TSchema;

  protected payload!: z.infer<TSchema>;

  constructor(
    protected rawPayload: JSONValue,
    protected ctx: GameContext
  ) {}

  protected abstract impl(): void;

  execute() {
    const parsed = this.payloadSchema.safeParse(this.rawPayload);
    if (!parsed.success) return;
    this.payload = parsed.data;

    return this.impl();
  }

  serialize(): RawAction {
    return { type: this.name, payload: this.rawPayload };
  }
}

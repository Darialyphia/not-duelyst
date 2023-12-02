import { z } from 'zod';
import { GameContext } from '../game';
import { InputName, SerializedInput } from './input-reducer';
import { Serializable } from '../utils/interfaces';
import { JSONValue } from '@hc/shared';

export const defaultInputSchema = z.object({
  playerId: z.string()
});
export type DefaultSchema = typeof defaultInputSchema;

export abstract class PlayerInput<TSchema extends DefaultSchema> implements Serializable {
  abstract readonly name: InputName;

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

  serialize(): SerializedInput {
    return { type: this.name, payload: this.rawPayload };
  }
}

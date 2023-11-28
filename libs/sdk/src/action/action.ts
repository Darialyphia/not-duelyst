import { AnyZodObject, z } from 'zod';
import { Game, GameContext } from '../game';
import { Entity } from '../entity/entity';
import { ActionName, RawAction } from './action-reducer';

export const defaultActionSchema = z.object({
  playerId: z.string()
});

export abstract class GameAction<TSchema extends typeof defaultActionSchema> {
  protected abstract name: ActionName;
  protected abstract payloadSchema: TSchema;

  constructor(protected rawPayload: unknown) {}

  protected abstract impl(payload: z.infer<TSchema>, ctx: GameContext): void;

  execute(ctx: GameContext) {
    const parsed = this.payloadSchema.safeParse(this.rawPayload);
    if (!parsed.success) return;

    return this.impl(parsed.data, ctx);
  }

  serialize(): RawAction {
    return { type: this.name, payload: this.rawPayload };
  }
}

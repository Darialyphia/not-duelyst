import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema.extend({
  cardIndex: z.number().nonnegative()
});

export class ReplaceCardAction extends GameAction<typeof schema> {
  readonly name = 'replaceCard';

  protected payloadSchema = schema;

  async impl() {
    await this.player.replaceCard(this.payload.cardIndex);
  }
}

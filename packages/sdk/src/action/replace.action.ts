import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { config } from '../config';

const schema = defaultActionSchema.extend({
  cardIndex: z
    .number()
    .nonnegative()
    .max(config.MAX_HAND_SIZE - 1)
});

export class ReplaceCardAction extends GameAction<typeof schema> {
  readonly name = 'replaceCard';

  protected payloadSchema = schema;

  async impl() {
    this.player.replaceCard(this.payload.cardIndex);
  }
}

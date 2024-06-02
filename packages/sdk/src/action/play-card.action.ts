import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { config } from '../config';

const schema = defaultActionSchema.extend({
  cardIndex: z
    .number()
    .nonnegative()
    .max(config.MAX_HAND_SIZE - 1),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }),
  targets: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    })
    .array(),
  blueprintFollowup: z.number().array()
});

export class PlayCardAction extends GameAction<typeof schema> {
  readonly name = 'playCard';

  protected payloadSchema = schema;

  get card() {
    return this.player.getCardFromHand(this.payload.cardIndex);
  }

  async impl() {
    if (!this.player.canPlayCardAtIndex(this.payload.cardIndex)) {
      return this.printError(
        `Not allowed to play card at index ${this.payload.cardIndex}`
      );
    }

    if (!this.card) {
      return this.printError(`Card not found at index ${this.payload.cardIndex}`);
    }

    this.player.currentGold -= this.card.cost;

    await this.player.playCardAtIndex(this.payload.cardIndex, this.payload);
  }
}

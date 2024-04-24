import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { isDefined } from '@game/shared';
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
    .array()
});

export class PlayCardAction extends GameAction<typeof schema> {
  readonly name = 'playCard';

  protected payloadSchema = schema;

  async impl() {
    if (!this.player.canPlayCardAtIndex(this.payload.cardIndex)) {
      console.error(`Not allowed to play card at index ${this.payload.cardIndex}`);
      return;
    }

    const card = this.player.getCardFromHand(this.payload.cardIndex);
    if (!card) return;

    this.player.currentGold -= card.cost;
    if (card.hpCost) {
      this.player.general.takeDamage(card.hpCost, this.player.general);
    }

    return card.play(this.payload);
  }
}

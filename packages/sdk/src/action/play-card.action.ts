import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema.extend({
  cardIndex: z.number().nonnegative(),
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
  cardChoices: z.number().array()
});

export class PlayCardAction extends GameAction<typeof schema> {
  readonly name = 'playCard';

  protected payloadSchema = schema;

  get card() {
    return this.player.getCardFromHand(this.payload.cardIndex);
  }

  impl() {
    console.log(this.payload);
    if (!this.player.canPlayCardAtIndex(this.payload.cardIndex)) {
      return this.printError(
        `Not allowed to play card at index ${this.payload.cardIndex}`
      );
    }

    if (!this.card) {
      return this.printError(`Card not found at index ${this.payload.cardIndex}`);
    }
    const areTargetsValid = this.payload.targets.every((target, index) => {
      return this.card.blueprint.targets?.isTargetable(target, {
        card: this.card,
        session: this.session,
        playedPoint: this.payload.position,
        targets: this.payload.targets.slice(0, index) // only take targets up to that point, as a target could have different rules depending on its position
      });
    });

    if (!areTargetsValid) {
      return this.printError('Could not play cards: invalid targets.');
    }

    this.player.playCardAtIndex(this.payload.cardIndex, this.payload);
  }
}

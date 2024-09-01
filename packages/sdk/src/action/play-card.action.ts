import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import type { Card } from '../card/card';
import { GAME_PHASES } from '../game-session';

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
  choice: z.number()
});

export class PlayCardAction extends GameAction<typeof schema> {
  readonly name = 'playCard';
  readonly phase = GAME_PHASES.BATTLE;

  protected payloadSchema = schema;

  // This is used in cards onPlay effect to detect if a unit summon is an opening gambit or not
  cachedCard!: Card;

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
    this.cachedCard = this.card;

    const areTargetsValid = this.payload.targets.every((target, index) => {
      return this.card.targets?.isTargetable(target, {
        card: this.card,
        session: this.session,
        playedPoint: this.payload.position,
        targets: this.payload.targets.slice(0, index) // only take targets up to that point, as a target could have different rules depending on its position
      });
    });

    if (!areTargetsValid) {
      return this.printError('Could not play cards: invalid targets.');
    }

    await this.player.playCardAtIndex(this.payload.cardIndex, this.payload);
  }
}

import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GAME_PHASES } from '../game-session';

const schema = defaultActionSchema.extend({
  entityId: z.number(),
  targetId: z.number()
});

export class AttackAction extends GameAction<typeof schema> {
  readonly name = 'attack';
  readonly phase = GAME_PHASES.BATTLE;
  protected payloadSchema = schema;

  get entity() {
    return this.session.entitySystem.getEntityById(this.payload.entityId);
  }

  get target() {
    return this.session.entitySystem.getEntityById(this.payload.targetId);
  }

  async impl() {
    if (!this.entity) {
      return this.printError(`Entity not found: ${this.payload.entityId}`);
    }

    if (!this.target) {
      return this.printError(`Entity not found: ${this.payload.targetId}`);
    }

    if (!this.entity.canAttack(this.target)) {
      return this.printError(
        `Entity ${this.entity.id}(${this.entity.card.blueprintId}) cannot attack Entity ${this.target.id}(${this.target.card.blueprintId})`
      );
    }
    await this.entity.performAttack(this.target);
  }
}

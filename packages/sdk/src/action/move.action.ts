import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GAME_PHASES } from '../game-session';

const schema = defaultActionSchema.extend({
  entityId: z.number(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  })
});

export class MoveAction extends GameAction<typeof schema> {
  readonly name = 'move';
  readonly phase = GAME_PHASES.BATTLE;

  protected payloadSchema = schema;

  get entity() {
    return this.session.entitySystem.getEntityById(this.payload.entityId);
  }
  get path() {
    if (!this.entity) return null;
    return this.session.boardSystem.getPathTo(this.entity, this.payload.position);
  }

  async impl() {
    if (!this.entity) {
      return this.printError(`Entity not found: ${this.payload.entityId}`);
    }

    if (!this.path) {
      return this.printError(
        `No path found for destination ${JSON.stringify(this.payload.position)}.`
      );
    }

    if (!this.entity.canMove(this.path.distance)) {
      return this.printError(`Entity ${this.entity.id} cannot move to target cell.`);
    }

    await this.entity.move(this.path.path);
  }
}

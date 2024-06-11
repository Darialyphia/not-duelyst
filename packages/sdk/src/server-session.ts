import { noopFXContext } from './fx-system';
import { GameSession, type SerializedGameState } from './game-session';
import type { SerializedAction } from './action/action';
import type { FxEvent } from './client-session';

export class ServerSession extends GameSession {
  fxEvents: FxEvent[] = [];

  static create(state: SerializedGameState, seed: string) {
    return new ServerSession(state, {
      seed,
      isAuthoritative: true,
      fxSystem: noopFXContext
    });
  }

  setup() {
    super.setup();

    this.on('entity:before_destroy', entity => {
      this.fxEvents.push({ type: 'entity:destroyed', payload: { entityId: entity.id } });
    });

    this.on('entity:before-move', ({ entity, path }) => {
      this.fxEvents.push({
        type: 'entity:moved',
        payload: { entityId: entity.id, path }
      });
    });

    this.on('entity:before_attack', ({ entity, target }) => {
      this.fxEvents.push({
        type: 'entity:attack',
        payload: { entityId: entity.id, targetId: target.id }
      });
    });

    this.on('entity:before_realiate', ({ entity, target }) => {
      this.fxEvents.push({
        type: 'entity:retaliate',
        payload: { entityId: entity.id, targetId: target.id }
      });
    });

    this.on('entity:before_take_damage', ({ entity }) => {
      this.fxEvents.push({
        type: 'entity:take-damage',
        payload: { entityId: entity.id }
      });
    });
  }

  onUpdate(cb: (action: SerializedAction, opts: { fxEvents: FxEvent[] }) => void) {
    this.on('scheduler:flushed', () => {
      cb(this.actionSystem.getHistory().at(-1)!.serialize(), {
        fxEvents: this.fxEvents
      });
    });
  }

  dispatch(action: SerializedAction) {
    this.fxEvents = [];
    super.dispatch(action);
  }
}

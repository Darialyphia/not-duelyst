import { type MaybePromise } from '@game/shared';
import type { FXSystem } from './fx-system';
import {
  GameSession,
  type GameEvent,
  type GameFormat,
  type SerializedGameState,
  type StarEvent
} from './game-session';
import type { SerializedAction } from './action/action';
import { ClientRngSystem } from './rng-system';
import { CARDS } from './card/card-lookup';

type EventCallback = {
  pre: (event: StarEvent, index: number, otherEvents: StarEvent[]) => MaybePromise<void>;
  post: (event: StarEvent, index: number, otherEvents: StarEvent[]) => void;
};

export class ClientSession extends GameSession {
  logger = (...args: any[]) => void 0;
  static create(
    state: SerializedGameState,
    options: { fxSystem: FXSystem; format: GameFormat; winnerId?: string }
  ) {
    const rngSystem = new ClientRngSystem();
    rngSystem.values = state.rng.values;

    return new ClientSession(state, rngSystem, options.fxSystem, {
      winnerId: options.winnerId,
      format: {
        config: options.format.config,
        cards: { ...CARDS, ...options.format.cards }
      }
    });
  }

  private eventCallbacksMap: Map<GameEvent, EventCallback[]> = new Map();

  onAsyncDispatch(name: GameEvent, cb: EventCallback) {
    if (!this.eventCallbacksMap.has(name)) {
      this.eventCallbacksMap.set(name, []);
    }

    const events = this.eventCallbacksMap.get(name)!;
    events.push(cb);

    return () => {
      events!.splice(events.indexOf(cb), 1);
    };
  }

  private async handlePreEventCallbacks(events: StarEvent[]) {
    for (const [index, event] of events.entries()) {
      const callbacks = this.eventCallbacksMap.get(event.eventName) ?? [];
      await Promise.all(callbacks.map(cb => cb.pre(event, index, events)));
      callbacks.forEach(cb => cb.post(event, index, events));

      // await match(event)
      //   .with({ eventName: 'entity:after_move' }, async (event: any) => {
      //     const stopRunning = this.fxSystem.playAnimationUntil(event.entity.id, 'run');
      //     await this.fxSystem.moveEntity(
      //       event.entity.id,
      //       event.path.map(point => ({
      //         point,
      //         duration: 0.4
      //       }))
      //     );
      //     stopRunning();
      //   })
      //   .with({ type: 'entity:attack' }, async ({ payload }) => {
      //     await this.fxSystem.playAnimation(payload.entityId, 'attack', {
      //       framePercentage: 0.75
      //     });
      //   })
      //   .with({ type: 'entity:take-damage' }, async ({ payload }) => {
      //     const bloodFx = randomInt(4);
      //     const effects = [
      //       this.fxSystem.playSfxOnEntity(payload.entityId, {
      //         resourceName: 'fx_bloodground',
      //         animationName:
      //           bloodFx <= 1 ? 'default' : `bloodground${bloodFx ? bloodFx : ''}`,
      //         offset: {
      //           x: 0,
      //           y: 20
      //         }
      //       }),
      //       this.fxSystem.playAnimation(payload.entityId, 'hit')
      //     ];
      //     const next = events[index + 1];
      //     // make sure we only await on the last unit if it's an AOE
      //     if (next?.type !== 'entity:take-damage') {
      //       await Promise.all(effects);
      //     }
      //   })
      //   .with({ type: 'entity:retaliate' }, async ({ payload }) => {
      //     await this.fxSystem.playAnimation(payload.entityId, 'attack', {
      //       framePercentage: 0.75
      //     });
      //     // await this.fxSystem.attack(payload.entityId, payload.targetId);
      //   })
      //   .with({ type: 'entity:destroyed' }, async ({ payload }) => {
      //     await this.fxSystem.playAnimation(payload.entityId, 'death');
      //     await this.fxSystem.fadeOutEntity(payload.entityId, 0.8);
      //   })
      //   .exhaustive();
    }
  }

  // private handlePostEventCallbacks(events: StarEvent[]) {
  //   for (const [index, event] of events.entries()) {
  //     const callbacks = this.eventCallbacksMap.get(event.eventName) ?? [];
  //     callbacks.forEach(cb => cb.post(event, index, events));
  //   }
  // }

  dispatch(
    action: SerializedAction,
    meta: { events: StarEvent[]; rngValues: number[] } = { events: [], rngValues: [] }
  ) {
    this.rngSystem.values = meta.rngValues;
    this.handlePreEventCallbacks(meta.events).then(() => {
      super.dispatch(action);
    });
  }
}

import { noopFXContext, type FXSystem } from './fx-system';
import {
  GameSession,
  type GameFormat,
  type SerializedGameState,
  type StarEvent
} from './game-session';
import type { SerializedAction } from './action/action';
import { ServerRngSystem, type RngSystem } from './rng-system';
import { CARDS } from './card/card-lookup';
import type { EntityId } from './entity/entity';
import type { Point3D } from '@game/shared';

export type SimulationResult = {
  damageTaken: Record<EntityId, number>;
  healReceived: Record<EntityId, number>;
  deaths: EntityId[];
  newEntities: Array<{ id: EntityId; position: Point3D; spriteId: string }>;
};

export class ServerSession extends GameSession {
  static create(
    state: SerializedGameState,
    options: { seed: string; format: GameFormat }
  ) {
    return new ServerSession(state, new ServerRngSystem(options.seed), noopFXContext, {
      seed: options.seed,
      format: {
        config: options.format.config,
        cards: { ...CARDS, ...options.format.cards }
      }
    });
  }

  protected rngSeed: string;

  protected constructor(
    initialState: SerializedGameState,
    rngSystem: RngSystem,
    fxSystem: FXSystem,
    options: {
      winnerId?: string;
      format: GameFormat;
      seed: string;
    }
  ) {
    super(initialState, rngSystem, fxSystem, options);
    this.rngSeed = options.seed;
  }

  onUpdate(cb: (action: SerializedAction, opts: { rngValues: number[] }) => void) {
    this.on('scheduler:flushed', () => {
      cb(this.actionSystem.getHistory().at(-1)!.serialize(), {
        // events: this.eventsSinceLastDispatch,
        rngValues: this.rngSystem.values
      });
    });
  }

  simulateAction(action: SerializedAction) {
    const session = new GameSession(
      { ...this.initialState, history: this.actionSystem.serialize() },
      new ServerRngSystem(this.rngSeed),
      this.fxSystem,
      {
        format: this.format
      }
    );

    const result: SimulationResult = {
      damageTaken: {},
      healReceived: {},
      deaths: [],
      newEntities: []
    };

    session.on('entity:after_take_damage', event => {
      if (result.damageTaken[event.entity.id]) {
        result.damageTaken[event.entity.id] += event.amount;
      } else {
        result.damageTaken[event.entity.id] = event.amount;
      }
    });

    session.on('entity:after_heal', event => {
      if (result.healReceived[event.entity.id]) {
        result.healReceived[event.entity.id] += event.amount;
      } else {
        result.healReceived[event.entity.id] = event.amount;
      }
    });

    session.on('entity:after_destroy', event => {
      result.deaths.push(event.id);
    });

    session.on('entity:created', event => {
      result.newEntities.push({
        id: event.id,
        spriteId: event.card.blueprint.spriteId,
        position: event.position.serialize()
      });
    });

    session.dispatch(action);
    session.removeAllListeners();
    console.log(result);
    return result;
  }
}

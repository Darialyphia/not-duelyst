import { noopFXContext, type FXSystem } from './fx-system';
import {
  GameSession,
  type GameFormat,
  type SerializedGameState,
  type SessionLogger
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
  newEntities: Array<{
    id: EntityId;
    position: Point3D;
    spriteId: string;
    pedestalId: string;
  }>;
};

const serverLogger: SessionLogger = console.log;

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
    super(initialState, rngSystem, fxSystem, serverLogger, options);
    this.rngSeed = options.seed;
  }

  onUpdate(cb: (action: SerializedAction, opts: { rngValues: number[] }) => void) {
    this.on('scheduler:flushed', () => {
      const lastAction = this.actionSystem.getHistory().at(-1);
      if (lastAction) {
        cb(this.actionSystem.getHistory().at(-1)!.serialize(), {
          rngValues: this.rngSystem.values
        });
      }
    });
  }

  simulateAction(action: SerializedAction) {
    return new Promise<SimulationResult>(resolve => {
      const session = new GameSession(
        { ...this.initialState, history: this.actionSystem.serialize() },
        new ServerRngSystem(this.rngSeed),
        this.fxSystem,
        () => void 0,
        {
          format: this.format
        }
      );

      session.once('game:ready', () => {
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
            pedestalId: event.card.pedestalId,
            position: event.position.serialize()
          });
        });

        session.on('scheduler:flushed', () => {
          resolve(result);
        });
        void session.dispatch(action);
      });
    });
  }
}

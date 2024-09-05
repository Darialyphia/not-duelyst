import {
  GameSession,
  type GameFormat,
  type SerializedGameState,
  type SessionLogger,
  type SimulationResult
} from './game-session';
import type { GameAction, SerializedAction } from './action/action';
import { ServerRngSystem, type RngSystem } from './rng-system';
import { CARDS } from './card/card-lookup';
import type { EntityId } from './entity/entity';
import type { Nullable, Point3D } from '@game/shared';
import { ServerFxSystem, type IFxSystem } from './fx-system';

const serverLogger: SessionLogger = console.log;

export class ServerSession extends GameSession {
  latestAction: Nullable<GameAction<any>> = null;
  static create(
    state: SerializedGameState,
    options: { seed: string; format: GameFormat }
  ) {
    return new ServerSession(
      state,
      new ServerRngSystem(options.seed),
      new ServerFxSystem(),
      {
        seed: options.seed,
        format: {
          map: options.format.map,
          config: options.format.config,
          cards: { ...CARDS, ...options.format.cards }
        }
      }
    );
  }

  protected rngSeed: string;

  protected constructor(
    initialState: SerializedGameState,
    rngSystem: RngSystem,
    fxSystem: IFxSystem,
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
    let lastIndexSent = 0;
    this.on('scheduler:flushed', () => {
      const lastAction = this.actionSystem.getHistory().at(-1);
      if (this.latestAction === lastAction) return;
      if (lastAction) {
        cb(this.actionSystem.getHistory().at(-1)!.serialize(), {
          rngValues: this.rngSystem.values.slice(lastIndexSent)
        });
        lastIndexSent = this.rngSystem.values.length;
        this.latestAction = lastAction;
      }
    });
  }

  simulateAction(action: SerializedAction) {
    return this.runSimulation(
      action,
      new GameSession(
        { ...this.initialState, history: this.actionSystem.serialize() },
        new ServerRngSystem(this.rngSeed),
        this.fxSystem,
        () => void 0,
        {
          format: this.format,
          parsedBlueprints: this.cardBlueprints
        }
      )
    );
  }
}

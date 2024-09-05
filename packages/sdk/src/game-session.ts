import { EntitySystem } from './entity/entity-system';
import { BoardSystem, type BoardSystemOptions } from './board/board-system';
import { PlayerSystem } from './player/player-system';
import {
  ENTITY_EVENTS,
  type EntityEvent,
  type EntityEventMap,
  type EntityId,
  type SerializedEntity
} from './entity/entity';
import type { GameAction, SerializedAction } from './action/action';
import type { Nullable, Point3D, Prettify, Values } from '@game/shared';
import {
  PLAYER_EVENTS,
  type PlayerEvent,
  type PlayerEventMap,
  type PlayerId,
  type SerializedPlayer
} from './player/player';
import { ActionSystem } from './action/action-system';
import { type IFxSystem } from './fx-system';
import type { RngSystem } from './rng-system';
import {
  CARD_EVENTS,
  type CardBlueprintId,
  type CardEvent,
  type CardEventMap
} from './card/card';
import type { DeckEvent, DeckEventMap } from './card/deck';
import {
  ARTIFACT_EVENTS,
  type ArtifactEvent,
  type ArtifactEventMap
} from './player/player-artifact';
import { type GameSessionConfig } from './config';
import type { CardBlueprint, GenericSerializedBlueprint } from './card/card-blueprint';
import { parseSerializeBlueprint } from './card/card-parser';
import { TypedEventEmitter } from './utils/typed-emitter';
import { nanoid } from 'nanoid';
import { validateLoadout } from './utils/loader-validator';

export type SerializedGameState = {
  entities: Array<SerializedEntity>;
  players: [SerializedPlayer, SerializedPlayer];
  history: SerializedAction[];
  rng: {
    values: number[];
  };
};

export type GameFormat = {
  config: GameSessionConfig;
  cards: Record<string, GenericSerializedBlueprint>;
  map: BoardSystemOptions;
};

type GlobalEntityEvents = {
  [Event in EntityEvent as `entity:${Event}`]: EntityEventMap[Event];
};
type GlobalPlayerEvents = {
  [Event in PlayerEvent as `player:${Event}`]: PlayerEventMap[Event];
};
type GlobalCardEvents = {
  [Event in CardEvent as `card:${Event}`]: CardEventMap[Event];
};
type GlobalDeckEvents = {
  [Event in DeckEvent as `deck:${Event}`]: DeckEventMap[Event];
};
type GlobalArtifactEvents = {
  [Event in ArtifactEvent as `artifact:${Event}`]: ArtifactEventMap[Event];
};

type GameEventsBase = {
  '*': [e: StarEvent];
  'game:action-start': [GameAction<any>];
  'game:action': [GameAction<any>];
  'scheduler:flushed': [];
  'game:ready': [];
  'game:ended': [PlayerId];
  'game:error': [Error];
};
export type GameEventMap = Prettify<
  GameEventsBase &
    GlobalEntityEvents &
    GlobalPlayerEvents &
    GlobalCardEvents &
    GlobalDeckEvents &
    GlobalArtifactEvents
>;

export type StarEvent<T extends Exclude<GameEvent, '*'> = Exclude<GameEvent, '*'>> = {
  eventName: T;
  event: GameEventMap[T];
};

export type GameEvent = keyof GameEventMap;
export type GameEventPayload<T extends GameEvent> = GameEventMap[T];

export type SessionLogger = (message?: any, ...optionalParams: any[]) => void;

export const GAME_PHASES = {
  MULLIGAN: 'MULLIGAN',
  BATTLE: 'BATTLE'
} as const;

export type GamePhase = Values<typeof GAME_PHASES>;

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

export class GameSession extends TypedEventEmitter<GameEventMap> {
  static getLoadoutViolations(
    loadout: SerializedGameState['players'][number]['deck'],
    format: GameFormat
  ) {
    return validateLoadout(loadout, format);
  }

  phase: GamePhase = GAME_PHASES.MULLIGAN;

  format: GameFormat;

  config: GameSessionConfig;

  cardBlueprints: Record<CardBlueprintId, CardBlueprint>;

  actionSystem = new ActionSystem(this);

  entitySystem = new EntitySystem(this);

  playerSystem = new PlayerSystem(this);

  boardSystem = new BoardSystem(this);

  isReady = false;

  winnerId: Nullable<string> = null;

  currentTurn = 0;

  id: string;
  protected constructor(
    protected initialState: SerializedGameState,
    public rngSystem: RngSystem,
    public fxSystem: IFxSystem,
    public logger: SessionLogger,
    options: {
      winnerId?: string;
      format: GameFormat;
      parsedBlueprints?: Record<CardBlueprintId, CardBlueprint>;
    }
  ) {
    super();
    this.id = nanoid(6);
    this.format = options.format;
    this.config = options.format.config;
    this.cardBlueprints =
      options.parsedBlueprints ??
      Object.fromEntries(
        Object.entries(options.format.cards).map(([key, value]) => {
          const res = [
            key,
            parseSerializeBlueprint(value, options.format, { noCache: true })
          ];
          return res;
        })
      );
    this.winnerId = options.winnerId;
    void this.setup().then(() => {
      this.emit('game:ready');
      this.isReady = true;
    });
  }

  private setupStarEvents() {
    [
      ...Object.values(ENTITY_EVENTS).map(e => `entity:${e}`),
      ...Object.values(PLAYER_EVENTS).map(e => `player:${e}`),
      ...Object.values(CARD_EVENTS).map(e => `card:${e}`),
      ...Object.values(ARTIFACT_EVENTS).map(e => `artifact:${e}`),
      'game:action',
      'game:action-start',
      'game:ready'
      // 'scheduler:flushed'
    ].forEach(eventName => {
      this.on(eventName as any, async event => {
        // this.logger(`%c[EVENT:${this.id}:${eventName}]`, 'color: #008b8b');

        await this.emitAsync('*', { eventName, event } as any);
      });
    });
  }

  protected async setup() {
    if (this.isReady) return;
    this.setupStarEvents();

    this.boardSystem.setup(this.format.map);
    await this.playerSystem.setup(this.initialState.players);
    this.entitySystem.setup(this.initialState.entities);
    await this.actionSystem.setup(this.initialState.history);

    this.on('entity:after_destroy', e => {
      if (!e.player.general) {
        this.winnerId = e.player.opponent.id;
        this.emit('game:ended', e.player.opponent.id);
      }
    });
  }

  dispatch(action: SerializedAction) {
    return this.actionSystem.dispatch(action);
  }

  onReady(cb: () => void) {
    if (this.isReady) return cb();
    this.on('game:ready', cb);
  }

  serialize(): SerializedGameState {
    return {
      ...this.initialState,
      rng: this.rngSystem.serialize(),
      history: this.actionSystem.serialize()
    };
  }

  runSimulation(action: SerializedAction, session: GameSession) {
    return new Promise<SimulationResult>(resolve => {
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
          session.removeAllListeners();
        });
        void session.dispatch(action);
      });
    });
  }
}

import { EntitySystem } from './entity/entity-system';
import { BoardSystem, type BoardSystemOptions } from './board/board-system';
import { PlayerSystem } from './player/player-system';
import {
  ENTITY_EVENTS,
  type EntityEvent,
  type EntityEventMap,
  type SerializedEntity
} from './entity/entity';
import type { GameAction, SerializedAction } from './action/action';
import type { Nullable, Prettify } from '@game/shared';
import {
  PLAYER_EVENTS,
  type PlayerEvent,
  type PlayerEventMap,
  type PlayerId,
  type SerializedPlayer
} from './player/player';
import { ActionSystem } from './action/action-system';
import { ClientFxSystem, type IFxSystem } from './fx-system';
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
import { CARDS } from './card/card-lookup';
import { parseSerializeBlueprint } from './card/card-parser';
import { TypedEventEmitter } from './utils/typed-emitter';
import { nanoid } from 'nanoid';

export type SerializedGameState = {
  map: BoardSystemOptions;
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

export class GameSession extends TypedEventEmitter<GameEventMap> {
  static getLoadoutViolations(
    loadout: SerializedGameState['players'][number]['deck'],
    format: GameFormat
  ) {
    const formatCards = { ...CARDS, ...format.cards };
    const violations: string[] = [];
    if (loadout.length !== format.config.MAX_DECK_SIZE) {
      violations.push('deck size is incorrect');
    }

    loadout.forEach(card => {
      if (!formatCards[card.blueprintId]) {
        violations.push(`a card that doesn't belong to this format: ${card.blueprintId}`);
      }
      const copies = loadout.reduce((total, current) => {
        return current.blueprintId === card.blueprintId ? total + 1 : total;
      }, 0);
      if (copies > format.config.MAX_COPIES_PER_CARD) {
        violations.push(`Max copies exceeded for ${card.blueprintId}`);
      }
    });

    return [...new Set(violations)];
  }

  format: GameFormat;

  config: GameSessionConfig;

  cardBlueprints: Record<CardBlueprintId, CardBlueprint>;

  actionSystem = new ActionSystem(this);

  entitySystem = new EntitySystem(this);

  playerSystem = new PlayerSystem(this);

  boardSystem = new BoardSystem(this);

  isReady = false;

  winnerId: Nullable<string> = null;

  id: string;
  protected constructor(
    protected initialState: SerializedGameState,
    public rngSystem: RngSystem,
    public fxSystem: IFxSystem,
    public logger: SessionLogger,
    options: {
      winnerId?: string;
      format: GameFormat;
    }
  ) {
    super();
    this.id = nanoid(6);
    this.format = options.format;
    this.config = options.format.config;
    this.cardBlueprints = Object.fromEntries(
      Object.entries(options.format.cards).map(([key, value]) => [
        key,
        parseSerializeBlueprint(value, options.format, { noCache: true })
      ])
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
      'game:ready'
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

    this.boardSystem.setup(this.initialState.map);
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
}

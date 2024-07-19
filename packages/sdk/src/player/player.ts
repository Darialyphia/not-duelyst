import { GameSession } from '../game-session';
import {
  type JSONObject,
  type Point3D,
  type Serializable,
  type Values
} from '@game/shared';
import {
  Card,
  CARD_EVENTS,
  type CardBlueprintId,
  type SerializedCard
} from '../card/card';
import EventEmitter from 'eventemitter3';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import { CARD_KINDS, FACTION_IDS } from '../card/card-enums';
import type { CardModifier } from '../modifier/card-modifier';
import { Deck, DECK_EVENTS } from '../card/deck';
import { createCard } from '../card/cards/card-factory';
import {
  ARTIFACT_EVENTS,
  PlayerArtifact,
  type PlayerArtifactId
} from './player-artifact';

export type PlayerId = string;
export type CardIndex = number;
export type SerializedPlayer = JSONObject & {
  id: PlayerId;
  name: string;
  maxGold?: number;
  currentGold?: number;
  isPlayer1: boolean;
  deck: SerializedCard[];
  graveyard: CardIndex[];
};

export const PLAYER_EVENTS = {
  TURN_START: 'turn_start',
  TURN_END: 'turn_end',
  BEFORE_GET_GOLD: 'before_get_gold',
  AFTER_GET_GOLD: 'after_get_gold',
  BEFORE_DRAW: 'before_draw',
  AFTER_DRAW: 'after_draw',
  BEFORE_REPLACE: 'before_replace',
  AFTER_REPLACE: 'after_replace'
} as const;

export type PlayerEvent = Values<typeof PLAYER_EVENTS>;
export type PlayerEventMap = {
  [PLAYER_EVENTS.TURN_START]: [Player];
  [PLAYER_EVENTS.TURN_END]: [Player];
  [PLAYER_EVENTS.BEFORE_GET_GOLD]: [{ player: Player; amount: number }];
  [PLAYER_EVENTS.AFTER_GET_GOLD]: [{ player: Player; amount: number }];
  [PLAYER_EVENTS.BEFORE_DRAW]: [{ player: Player }];
  [PLAYER_EVENTS.AFTER_DRAW]: [{ player: Player; cards: Card[] }];
  [PLAYER_EVENTS.BEFORE_REPLACE]: [{ player: Player; replacedCard: Card }];
  [PLAYER_EVENTS.AFTER_REPLACE]: [
    { player: Player; replacedCard: Card; replacement: Card }
  ];
};

export type PlayerInterceptor = Player['interceptors'];

export class Player extends EventEmitter<PlayerEventMap> implements Serializable {
  public readonly id: PlayerId;
  public readonly name: string;
  public readonly isPlayer1: boolean;
  public _maxGold: number;
  public currentGold: number;
  private isP2T1: boolean;

  artifacts: PlayerArtifact[] = [];
  graveyard!: Card[];
  cards!: Card[];
  deck!: Deck;
  hand!: Card[];
  runes = {
    [FACTION_IDS.F1]: 0,
    [FACTION_IDS.F2]: 0,
    [FACTION_IDS.F3]: 0,
    [FACTION_IDS.F4]: 0,
    [FACTION_IDS.F5]: 0
  };

  maxResourceActionsPerTurn = 1;
  resourceActionsTaken = 0;
  cardsReplacedThisTurn = 0;

  readonly interceptors = {
    maxGold: new Interceptable<number, Player>(),
    cost: new Interceptable<number, Card>(),
    maxReplaces: new Interceptable<number, Player>()
  };

  constructor(
    private session: GameSession,
    private options: SerializedPlayer
  ) {
    super();
    this.id = options.id;
    this.name = options.name;
    this.isPlayer1 = options.isPlayer1;
    this._maxGold =
      (options.maxMana ?? this.isPlayer1)
        ? this.session.config.PLAYER_1_STARTING_GOLD
        : this.session.config.PLAYER_2_STARTING_GOLD;
    this.isP2T1 = !this.isPlayer1;
    this.currentGold = options.currentGold ?? this.maxGold;
  }

  get maxGold(): number {
    return this.interceptors.maxGold.getValue(this._maxGold, this);
  }

  set maxGold(val) {
    this._maxGold = val;
  }

  get maxReplaces(): number {
    return this.interceptors.maxReplaces.getValue(
      this.session.config.MAX_REPLACES_PER_TURN,
      this
    );
  }

  get entities() {
    return this.session.entitySystem
      .getList()
      .filter(entity => entity.player.equals(this));
  }

  get isActive() {
    return this.session.playerSystem.activePlayer.equals(this);
  }

  get general() {
    return this.entities.find(entity => entity.isGeneral)!;
  }

  get opponent() {
    return this.session.playerSystem.getOpponent(this.id);
  }

  setup() {
    this.cards = this.options.deck.map((card, index) => {
      return createCard(this.session, card, index, this.id);
    });
    this.cards.forEach(card => {
      card.setup();
    });
    this.deck = new Deck(
      this.session,
      this.cards.filter(card => card.blueprint.kind !== CARD_KINDS.GENERAL),
      this.id
    );
    this.deck.shuffle();
    this.hand = this.deck.draw(this.session.config.STARTING_HAND_SIZE);

    this.deck.on(DECK_EVENTS.BEFORE_DRAW, () =>
      this.emit(PLAYER_EVENTS.BEFORE_DRAW, { player: this })
    );
    this.deck.on(DECK_EVENTS.AFTER_DRAW, ({ cards }) =>
      this.emit(PLAYER_EVENTS.AFTER_DRAW, { player: this, cards })
    );
    this.deck.on(DECK_EVENTS.BEFORE_REPLACE, ({ replacedCard }) =>
      this.emit(PLAYER_EVENTS.BEFORE_REPLACE, { player: this, replacedCard })
    );
    this.deck.on(DECK_EVENTS.AFTER_REPLACE, ({ replacedCard, replacement }) =>
      this.emit(PLAYER_EVENTS.AFTER_REPLACE, { player: this, replacedCard, replacement })
    );

    this.placeGeneral();

    this.graveyard = this.options.graveyard.map(index => this.cards[index]);
  }

  equipArtifact(cardIndex: CardIndex) {
    const artifact = new PlayerArtifact(this.session, { cardIndex, playerId: this.id });
    Object.values(ARTIFACT_EVENTS).forEach(eventName => {
      artifact.on(eventName, event => {
        this.session.emit(`artifact:${eventName}`, event as any);
      });
    });
    this.artifacts.push(artifact);
    artifact.setup();
  }

  unequipArtifact(id: PlayerArtifactId) {
    const artifact = this.artifacts.find(a => a.id === id);
    if (!artifact) return;
    this.artifacts = this.artifacts.filter(a => !a.equals(artifact));
  }

  placeGeneral() {
    const generalIndex = this.cards.findIndex(
      card => card.blueprint.kind === CARD_KINDS.GENERAL
    );

    this.session.entitySystem.addEntity({
      cardIndex: generalIndex,
      playerId: this.id,
      position: this.isPlayer1
        ? this.session.boardSystem.player1StartPosition
        : this.session.boardSystem.player2StartPosition
    });
  }

  canReplace() {
    return this.cardsReplacedThisTurn < this.maxReplaces;
  }

  replaceCard(index: number) {
    if (!this.canReplace()) return;
    const card = this.hand[index];
    if (!card) return;

    const replacement = this.deck.replace(card);
    this.hand[index] = replacement;
    this.cardsReplacedThisTurn++;
  }

  generateCard({
    blueprintId,
    pedestalId = 'pedestal-default',
    modifiers = []
  }: {
    blueprintId: CardBlueprintId;
    pedestalId: string;
    modifiers?: CardModifier[];
  }) {
    const card = createCard(
      this.session,
      { blueprintId, pedestalId, isGenerated: true },
      this.cards.length,
      this.id
    );
    Object.values(CARD_EVENTS).forEach(eventName => {
      card.on(eventName, event => {
        this.session.emit(`card:${eventName}`, event as any);
      });
    });
    modifiers.forEach(mod => card.addModifier(mod));
    this.cards.push(card);
    card.setup();

    return card;
  }

  serialize(): SerializedPlayer {
    return {
      id: this.id,
      name: this.name,
      deck: this.cards.map(card => card.serialize()),
      graveyard: this.graveyard.map(card => this.cards.indexOf(card)),
      isPlayer1: this.isPlayer1,
      maxGold: this.maxGold,
      currentGold: this.currentGold
    };
  }

  equals(player: Player) {
    return player.id === this.id;
  }

  endTun() {
    this.entities.forEach(entity => {
      entity.endTurn();
    });
    if (this.session.config.DRAW_AT_END_OF_TURN) {
      this.draw(this.session.config.CARD_DRAW_PER_TURN);
    }
    this.emit(PLAYER_EVENTS.TURN_END, this);
  }

  startTurn() {
    this.resourceActionsTaken = 0;
    this.cardsReplacedThisTurn = 0;

    this.entities.forEach(entity => entity.startTurn());
    if (!this.isP2T1) {
      this.maxGold += this.session.config.MAX_GOLD_INCREASE_PER_TURN;
      if (this.session.config.REFILL_GOLD_EVERY_TURN) {
        this.currentGold = this.maxGold;
      }
      this.giveGold(this.session.config.GOLD_PER_TURN);
      if (!this.session.config.DRAW_AT_END_OF_TURN) {
        this.draw(this.session.config.CARD_DRAW_PER_TURN);
      }
    } else {
      this.isP2T1 = false;
    }
    this.emit(PLAYER_EVENTS.TURN_START, this);
  }

  canPlayCardAtIndex(index: number) {
    const card = this.hand[index];
    if (!card) {
      console.error(`No card in hand at index ${index}`);
      return;
    }
    if (this.currentGold < card.cost) return false;
    return true;
  }

  playCardAtIndex(index: number, opts: { position: Point3D; targets: Point3D[] }) {
    const card = this.hand[index];
    if (!card) return;

    this.currentGold -= card.cost;
    this.hand.splice(index, 1);
    card.play(opts);
  }

  getCardFromHand(index: CardIndex) {
    return this.hand[index];
  }

  addInterceptor<T extends keyof PlayerInterceptor>(
    key: T,
    interceptor: inferInterceptor<PlayerInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);

    return () => this.removeInterceptor(key, interceptor);
  }

  removeInterceptor<T extends keyof PlayerInterceptor>(
    key: T,
    interceptor: inferInterceptor<PlayerInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }

  giveGold(amount: number, isResourceAction = false) {
    this.emit(PLAYER_EVENTS.BEFORE_GET_GOLD, { player: this, amount });
    this.currentGold = Math.min(this.currentGold + amount, this.session.config.MAX_GOLD);

    this.emit(PLAYER_EVENTS.AFTER_GET_GOLD, { player: this, amount });
    if (isResourceAction) {
      this.resourceActionsTaken++;
    }
  }

  draw(amount: number, isResourceAction = false) {
    const availableSlots = this.session.config.MAX_HAND_SIZE - this.hand.length;

    const newCards = this.deck.draw(Math.min(amount, availableSlots));
    if (newCards.length) {
      this.hand.push(...newCards);
    }

    if (isResourceAction) {
      this.resourceActionsTaken++;
    }
  }
}

import { GameSession } from '../game-session';
import {
  objectEntries,
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
import { config } from '../config';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import { CARD_KINDS, FACTION_IDS, FACTIONS } from '../card/card-enums';
import type { CardModifier } from '../modifier/card-modifier';
import { Deck } from '../card/deck';
import {} from '../card/cards/neutral/water-elemental';
import { MULTICOLOR } from '../card/card-blueprint';

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
  TURN_END: 'turn_end'
} as const;

export type PlayerEvent = Values<typeof PLAYER_EVENTS>;
export type PlayerEventMap = {
  [PLAYER_EVENTS.TURN_START]: [Player];
  [PLAYER_EVENTS.TURN_END]: [Player];
};

export type PlayerInterceptor = Player['interceptors'];

export class Player extends EventEmitter<PlayerEventMap> implements Serializable {
  public readonly id: PlayerId;
  public readonly name: string;
  public readonly isPlayer1: boolean;
  public _maxGold: number;
  public currentGold: number;
  private isP2T1: boolean;

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

  readonly interceptors = {
    maxGold: new Interceptable<number, Player>(),
    cost: new Interceptable<number, Card>(),
    maxResourceActionsPerTurn: new Interceptable<number, Player>()
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
      options.maxMana ?? this.isPlayer1
        ? config.PLAYER_1_STARTING_GOLD
        : config.PLAYER_2_STARTING_GOLD;
    this.isP2T1 = !this.isPlayer1;
    this.currentGold = options.currentGold ?? this.maxGold;
  }

  get maxGold(): number {
    return this.interceptors.maxGold.getValue(this._maxGold, this);
  }

  set maxGold(val) {
    this._maxGold = val;
  }

  get canPerformResourceAction(): boolean {
    return (
      this.resourceActionsTaken <
      this.interceptors.maxResourceActionsPerTurn.getValue(
        this.maxResourceActionsPerTurn,
        this
      )
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
      return new Card(this.session, index, card, this.id);
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
    this.hand = this.deck.draw(config.STARTING_HAND_SIZE);

    this.placeGeneral();

    this.graveyard = this.options.graveyard.map(index => this.cards[index]);
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

  generateCard({
    blueprintId,
    pedestalId = 'pedestal-default',
    modifiers = []
  }: {
    blueprintId: CardBlueprintId;
    pedestalId: string;
    modifiers?: CardModifier[];
  }) {
    const card = new Card(
      this.session,
      this.cards.length,
      { blueprintId, pedestalId, isGenerated: true },
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
    this.emit(PLAYER_EVENTS.TURN_END, this);
  }

  startTurn() {
    this.resourceActionsTaken = 0;
    this.entities.forEach(entity => entity.startTurn());
    if (!this.isP2T1) {
      this.giveGold(config.GOLD_PER_TURN);
      this.draw(1);
    } else {
      this.isP2T1 = false;
    }
    this.emit(PLAYER_EVENTS.TURN_START, this);
  }

  get totalRunesCount() {
    return Object.values(this.runes).reduce((acc, curr) => acc + curr);
  }

  canPlayCardAtIndex(index: number) {
    const card = this.hand[index];
    if (!card) {
      console.error(`No card in hand at index ${index}`);
      return;
    }
    if (this.currentGold < card.cost) return false;
    return Object.entries(card.blueprint.factions).every(([faction, count]) => {
      if (faction === MULTICOLOR) return this.totalRunesCount >= count;
      return this.runes[faction as keyof typeof this.runes] >= count;
    });
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
    this.currentGold = Math.min(this.currentGold + amount, config.MAX_GOLD);

    if (isResourceAction) {
      this.resourceActionsTaken++;
    }
  }

  draw(amount: number, isResourceAction = false) {
    const availableSlots = config.MAX_HAND_SIZE - this.hand.length;

    const newCards = this.deck.draw(Math.min(amount, availableSlots));
    this.hand.push(...newCards);

    if (isResourceAction) {
      this.resourceActionsTaken++;
    }
  }

  addRune(factionId: Values<typeof FACTION_IDS>) {
    this.runes[factionId]++;
    this.resourceActionsTaken++;
  }
}

import { GameSession } from '../game-session';
import {
  type JSONObject,
  type Nullable,
  type Serializable,
  type Values
} from '@game/shared';
import { Card, type CardBlueprintId, type SerializedCard } from '../card/card';
import EventEmitter from 'eventemitter3';
import { config } from '../config';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import { CARD_KINDS } from '../card/card-enums';

export type PlayerId = string;
export type CardIndex = number;
export type SerializedPlayer = JSONObject & {
  id: PlayerId;
  name: string;
  maxGold?: number;
  currentGold?: number;
  isPlayer1: boolean;
  cards: SerializedCard[];
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

  readonly interceptors = {
    maxGold: new Interceptable<number, Player>(),
    cost: new Interceptable<number, Card>()
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

  get hand() {
    return this.cards.filter(
      card => card.blueprint.kind === CARD_KINDS.MINION && !card.isGenerated
    );
  }

  get opponent() {
    return this.session.playerSystem.getOpponent(this.id);
  }

  setup() {
    this.cards = this.options.cards.map((card, index) => {
      return new Card(this.session, index, card, this.id);
    });
    this.cards.forEach(card => {
      card.setup();
    });
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

  generateCard(blueprintId: CardBlueprintId, pedestalId = 'pedestal-default') {
    const card = new Card(
      this.session,
      this.cards.length,
      { blueprintId, pedestalId, isGenerated: true },
      this.id
    );

    this.cards.push(card);

    return card;
  }

  serialize(): SerializedPlayer {
    return {
      id: this.id,
      name: this.name,
      cards: this.cards.map(card => card.serialize()),
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
    this.cards.forEach(card => card.onTurnStart());
    this.entities.forEach(entity => entity.startTurn());
    if (!this.isP2T1) {
      this.giveGold(config.GOLD_PER_TURN);
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
    return card.currentCooldown === 0;
  }

  getCardFromHand(index: CardIndex) {
    const card = this.hand[index];
    if (!card) {
      console.error(`No card in hand at index ${index}`);
      return;
    }

    return card;
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

  giveGold(amount: number) {
    this.currentGold = Math.min(this.currentGold + amount, config.MAX_GOLD);
  }
}

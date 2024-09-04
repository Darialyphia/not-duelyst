import { GAME_PHASES, GameSession } from '../game-session';
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
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import { CARD_KINDS, FACTION_IDS, type CardKind } from '../card/card-enums';
import type { CardModifier } from '../modifier/card-modifier';
import { Deck, DECK_EVENTS } from '../card/deck';
import { createCard } from '../card/cards/card-factory';
import {
  ARTIFACT_EVENTS,
  PlayerArtifact,
  type PlayerArtifactId
} from './player-artifact';
import type { Entity } from '../entity/entity';
import { TypedEventEmitter } from '../utils/typed-emitter';
import type { Unit } from '../card/unit';
import type { Artifact } from '../card/artifact';

export type PlayerId = string;
export type CardIndex = number;
export type SerializedPlayer = JSONObject & {
  id: PlayerId;
  name: string;
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
  AFTER_REPLACE: 'after_replace',
  BEFORE_PLAY_CARD: 'before_play_card',
  AFTER_PLAY_CARD: 'after_play_card'
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
  [PLAYER_EVENTS.BEFORE_PLAY_CARD]: [{ player: Player; card: Card }];
  [PLAYER_EVENTS.AFTER_PLAY_CARD]: [{ player: Player; card: Card }];
};

export type PlayerInterceptor = Player['interceptors'];

export class Player extends TypedEventEmitter<PlayerEventMap> implements Serializable {
  public readonly id: PlayerId;
  public readonly name: string;
  public readonly isPlayer1: boolean;
  public _maxGold: number;
  public currentGold: number;
  private isP2T1: boolean;
  public hasMulliganed = false;
  public mulliganIndices: number[] = [];
  artifacts: PlayerArtifact[] = [];
  graveyard!: Array<{ card: Card; deletedAt: number }>;
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
  playedCardSinceLastTurn: Card[] = [];

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
    this._maxGold = this.isPlayer1
      ? this.session.config.PLAYER_1_STARTING_GOLD
      : this.session.config.PLAYER_2_STARTING_GOLD;
    this.isP2T1 = !this.isPlayer1;
    this.currentGold = this.maxGold;
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

  get isHandFull() {
    return this.hand.length === this.session.config.MAX_HAND_SIZE;
  }

  setup() {
    this.cards = this.options.deck.map((card, index) => {
      return createCard(this.session, card, index, this.id) as Card;
    });

    this.deck = new Deck(
      this.session,
      this.cards.filter(card => card.blueprint.kind !== CARD_KINDS.GENERAL),
      this.id
    );
    this.deck.shuffle();

    this.deck.on(DECK_EVENTS.BEFORE_DRAW, () =>
      this.emitAsync(PLAYER_EVENTS.BEFORE_DRAW, { player: this })
    );
    this.deck.on(DECK_EVENTS.AFTER_DRAW, ({ cards }) =>
      this.emitAsync(PLAYER_EVENTS.AFTER_DRAW, { player: this, cards })
    );
    this.deck.on(DECK_EVENTS.BEFORE_REPLACE, ({ replacedCard }) =>
      this.emitAsync(PLAYER_EVENTS.BEFORE_REPLACE, { player: this, replacedCard })
    );
    this.deck.on(DECK_EVENTS.AFTER_REPLACE, ({ replacedCard, replacement }) =>
      this.emitAsync(PLAYER_EVENTS.AFTER_REPLACE, {
        player: this,
        replacedCard,
        replacement
      })
    );

    this.graveyard = this.options.graveyard.map(index => ({
      card: this.cards[index],
      deletedAt: this.session.currentTurn
    }));
  }

  async equipArtifact(card: Artifact, choice: number) {
    const artifact = new PlayerArtifact(this.session, { card, playerId: this.id });
    Object.values(ARTIFACT_EVENTS).forEach(eventName => {
      artifact.on(eventName, async event => {
        await this.session.emitAsync(`artifact:${eventName}`, event as any);
      });
    });
    this.artifacts.push(artifact);
    await artifact.setup(choice);
  }

  unequipArtifact(id: PlayerArtifactId) {
    const artifact = this.artifacts.find(a => a.id === id);
    if (!artifact) return;
    this.artifacts = this.artifacts.filter(a => !a.equals(artifact));
  }

  placeGeneral() {
    const general = this.cards.find(card => card.blueprint.kind === CARD_KINDS.GENERAL)!;

    this.session.entitySystem.addEntity(
      {
        position: this.isPlayer1
          ? this.session.boardSystem.player1StartPosition
          : this.session.boardSystem.player2StartPosition
      },
      general as Unit
    );
  }

  async drawStartingHand() {
    this.hand = await this.deck.draw(
      this.isPlayer1
        ? this.session.config.PLAYER_1_STARTING_HAND_SIZE
        : this.session.config.PLAYER_2_STARTING_HAND_SIZE
    );
  }

  canReplace() {
    return this.cardsReplacedThisTurn < this.maxReplaces;
  }

  async replaceCard(index: number) {
    if (!this.canReplace()) return;
    const card = this.hand[index];
    if (!card) return;

    const replacement = await this.deck.replace(card);
    this.hand[index] = replacement;
    if (this.session.phase !== GAME_PHASES.MULLIGAN) {
      this.cardsReplacedThisTurn++;
    }
  }

  generateCard({
    blueprintId,
    pedestalId = 'pedestal-default',
    cardBackId = 'default',
    modifiers = []
  }: {
    blueprintId: CardBlueprintId;
    cardBackId: string;
    pedestalId: string;
    modifiers?: CardModifier[];
  }) {
    const card = createCard(
      this.session,
      { blueprintId, pedestalId, cardBackId, isGenerated: true },
      this.cards.length,
      this.id
    );
    Object.values(CARD_EVENTS).forEach(eventName => {
      card.on(eventName, event =>
        this.session.emitAsync(`card:${eventName}`, event as any)
      );
    });
    modifiers.forEach(mod => card.addModifier(mod));
    this.cards.push(card as Card);
    card.setup();

    return card;
  }

  sendToGraveyard(card: Card) {
    this.graveyard.unshift({ card, deletedAt: this.session.currentTurn });
  }

  bounceToHand(entity: Entity) {
    this.session.entitySystem.removeEntity(entity);
    if (this.isHandFull) {
      this.sendToGraveyard(entity.card);
      return false;
    } else {
      this.hand.push(entity.card);
      return true;
    }
  }

  serialize(): SerializedPlayer {
    return {
      id: this.id,
      name: this.name,
      deck: this.cards.map(card => card.serialize()),
      graveyard: this.graveyard.map(card => this.cards.indexOf(card.card)),
      isPlayer1: this.isPlayer1,
      maxGold: this.maxGold,
      currentGold: this.currentGold
    };
  }

  equals(player: Player) {
    return player.id === this.id;
  }

  async endTun() {
    this.entities.forEach(entity => {
      entity.endTurn();
    });
    if (this.session.config.DRAW_AT_END_OF_TURN) {
      await this.draw(this.session.config.CARD_DRAW_PER_TURN);
    }
    await this.emitAsync(PLAYER_EVENTS.TURN_END, this);
  }

  async startTurn() {
    this.resourceActionsTaken = 0;
    this.cardsReplacedThisTurn = 0;
    this.playedCardSinceLastTurn = [];

    this.entities.forEach(entity => entity.startTurn());
    if (!this.isP2T1) {
      this.maxGold += this.session.config.MAX_GOLD_INCREASE_PER_TURN;
      if (this.session.config.REFILL_GOLD_EVERY_TURN) {
        this.currentGold = this.maxGold;
      }
      await this.giveGold(this.session.config.GOLD_PER_TURN);
      if (!this.session.config.DRAW_AT_END_OF_TURN) {
        await this.draw(this.session.config.CARD_DRAW_PER_TURN);
      }
    } else {
      this.isP2T1 = false;
    }
    await this.emitAsync(PLAYER_EVENTS.TURN_START, this);
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

  async playCardAtIndex(
    index: number,
    opts: { position: Point3D; targets: Point3D[]; choice: number }
  ) {
    const card = this.hand[index];
    if (!card) return;
    await this.playCard(card, opts);
  }

  async playCard(
    card: Card,
    {
      position,
      targets,
      choice,
      spendGold = true
    }: { position: Point3D; targets: Point3D[]; spendGold?: boolean; choice: number }
  ) {
    await this.emitAsync(PLAYER_EVENTS.BEFORE_PLAY_CARD, { player: this, card });

    if (spendGold) {
      this.currentGold -= card.cost;
    }

    const idxInHand = this.hand.indexOf(card);
    if (idxInHand > -1) {
      this.hand.splice(idxInHand, 1);
    }
    const idxInDeck = this.deck.cards.indexOf(card);
    if (idxInDeck > -1) {
      this.deck.pluck(card);
    }

    const isSuccess = await card.play({ position, targets, choice });
    if (!isSuccess) {
      if (spendGold) {
        this.currentGold += card.cost;
      }
      if (idxInHand > -1) {
        this.hand.splice(idxInHand, 0, card);
      }
      if (idxInDeck > -1) {
        this.deck.cards.splice(idxInDeck, 0, card);
      }
      return;
    }

    this.playedCardSinceLastTurn.push(card);
    await this.emitAsync(PLAYER_EVENTS.AFTER_PLAY_CARD, { player: this, card });
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

  async giveGold(amount: number) {
    await this.emitAsync(PLAYER_EVENTS.BEFORE_GET_GOLD, { player: this, amount });
    this.currentGold = Math.min(this.currentGold + amount, this.session.config.MAX_GOLD);

    await this.emitAsync(PLAYER_EVENTS.AFTER_GET_GOLD, { player: this, amount });
  }

  async draw(amount: number) {
    const availableSlots = this.session.config.MAX_HAND_SIZE - this.hand.length;

    const newCards = await this.deck.draw(Math.min(amount, availableSlots));
    if (newCards.length) {
      this.hand.push(...newCards);
    }
  }

  drawFromKind(amount: number, kind: Exclude<CardKind, 'GENERAL'>) {
    const availableSlots = this.session.config.MAX_HAND_SIZE - this.hand.length;

    const pool = this.deck.cards.filter(card => card.kind === kind);
    const shuffledPool = pool.sort(() => this.session.rngSystem.next() - 0.5);

    const cards = shuffledPool.slice(0, Math.min(amount, availableSlots, pool.length));
    if (cards) {
      cards.forEach(c => c.draw());
      this.hand.push(...cards);
    }
  }
}

import type { GameSession } from '../game-session';
import type { Point3D, Serializable, Values } from '@game/shared';
import type { CardIndex, PlayerId } from '../player/player';
import EventEmitter from 'eventemitter3';
import type { ModifierId } from '../modifier/entity-modifier';
import type { CardModifier } from '../modifier/card-modifier';
import { SafeEventEmitter } from '../utils/safe-event-emitter';

export type CardBlueprintId = string;

export type SerializedCard = {
  blueprintId: CardBlueprintId;
  cardBackId: string;
  pedestalId: string;
  isGenerated?: boolean;
};

export const CARD_EVENTS = {
  BEFORE_PLAYED: 'before_played',
  AFTER_PLAYED: 'after_played',
  DRAWN: 'drawn',
  REPLACED: 'replaced'
} as const;

export type CardEvent = Values<typeof CARD_EVENTS>;

export type CardEventMap = {
  [CARD_EVENTS.BEFORE_PLAYED]: [Card];
  [CARD_EVENTS.AFTER_PLAYED]: [Card];
  [CARD_EVENTS.DRAWN]: [Card];
  [CARD_EVENTS.REPLACED]: [Card];
};

export abstract class Card extends SafeEventEmitter implements Serializable {
  readonly blueprintId: CardBlueprintId;
  readonly isGenerated: boolean;
  public readonly pedestalId: string;
  public readonly cardBackId: string;
  modifiers: CardModifier[] = [];

  constructor(
    protected session: GameSession,
    readonly index: CardIndex,
    options: SerializedCard,
    protected playerId: PlayerId
  ) {
    super();
    this.blueprintId = options.blueprintId;
    this.pedestalId = options.pedestalId;
    this.cardBackId = options.cardBackId;
    this.isGenerated = options.isGenerated ?? false;
  }

  setup() {
    this.blueprint.modifiers?.forEach(modifier => {
      this.addModifier(modifier);
    });
  }

  get player() {
    return this.session.playerSystem.getPlayerById(this.playerId)!;
  }

  get blueprint() {
    return this.session.cardBlueprints[this.blueprintId];
  }

  get kind() {
    return this.blueprint.kind;
  }

  abstract get cost(): number;

  abstract canPlayAt(point: Point3D): boolean;

  abstract playImpl(ctx: { position: Point3D; targets: Point3D[] }): void;

  getModifier(id: ModifierId) {
    return this.modifiers.find(m => m.id === id);
  }

  addModifier(modifier: CardModifier) {
    this.modifiers.push(modifier);
    return modifier.onApplied(this.session, this, modifier);
  }

  removeModifier(modifierId: ModifierId) {
    this.modifiers.forEach(mod => {
      if (mod.id !== modifierId) return;

      mod.onRemoved(this.session, this, mod);
    });

    this.modifiers = this.modifiers.filter(mod => {
      return mod.id !== modifierId;
    });
  }

  draw() {
    this.emit(CARD_EVENTS.DRAWN, this);
  }

  replace() {
    this.emit(CARD_EVENTS.REPLACED, this);
  }

  play(ctx: { position: Point3D; targets: Point3D[] }) {
    this.emit(CARD_EVENTS.BEFORE_PLAYED, this);
    this.playImpl(ctx);
    this.emit(CARD_EVENTS.AFTER_PLAYED, this);
  }

  serialize(): SerializedCard {
    return {
      blueprintId: this.blueprintId,
      pedestalId: this.pedestalId,
      cardBackId: this.cardBackId
    };
  }
}

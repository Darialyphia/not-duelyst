import type { GameSession } from '../game-session';
import type { AnyObject, Point3D, Serializable, Values } from '@game/shared';
import type { CardIndex, Player, PlayerId } from '../player/player';
import type { ModifierId } from '../modifier/entity-modifier';
import type { CardModifier } from '../modifier/card-modifier';
import { nanoid } from 'nanoid';
import { TypedEventEmitter } from '../utils/typed-emitter';

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
  REPLACED: 'replaced',
  CHANGE_OWNER: 'change_owner'
} as const;

export type CardEvent = Values<typeof CARD_EVENTS>;

export type CardEventMap = {
  [CARD_EVENTS.BEFORE_PLAYED]: [Card];
  [CARD_EVENTS.AFTER_PLAYED]: [Card];
  [CARD_EVENTS.DRAWN]: [Card];
  [CARD_EVENTS.REPLACED]: [Card];
  [CARD_EVENTS.CHANGE_OWNER]: [Card];
};

export abstract class Card
  extends TypedEventEmitter<CardEventMap>
  implements Serializable
{
  readonly blueprintId: CardBlueprintId;
  readonly isGenerated: boolean;
  public readonly pedestalId: string;
  public readonly cardBackId: string;
  modifiers: CardModifier[] = [];

  meta: AnyObject = {};
  id = nanoid(6);

  originalOwner: Player;

  constructor(
    public session: GameSession,
    public index: CardIndex,
    options: SerializedCard,
    protected playerId: PlayerId
  ) {
    super();
    this.blueprintId = options.blueprintId;
    this.pedestalId = options.pedestalId;
    this.cardBackId = options.cardBackId;
    this.isGenerated = options.isGenerated ?? false;
    this.originalOwner = this.player;
  }

  equals(card: Card) {
    return card.id === this.id;
  }

  setup() {
    this.blueprint.modifiers?.().forEach(modifier => {
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

  abstract playImpl(ctx: { position: Point3D; targets: Point3D[] }): Promise<void>;

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
    return this.emitAsync(CARD_EVENTS.DRAWN, this);
  }

  replace() {
    return this.emitAsync(CARD_EVENTS.REPLACED, this);
  }

  async play(ctx: { position: Point3D; targets: Point3D[] }) {
    await this.emitAsync(CARD_EVENTS.BEFORE_PLAYED, this);

    await this.playImpl(ctx);

    await this.emitAsync(CARD_EVENTS.AFTER_PLAYED, this);
  }

  serialize(): SerializedCard {
    return {
      blueprintId: this.blueprintId,
      pedestalId: this.pedestalId,
      cardBackId: this.cardBackId
    };
  }

  changePlayer(newPlayerId: PlayerId) {
    this.playerId = newPlayerId;
    this.emit(CARD_EVENTS.CHANGE_OWNER, this);
  }
}

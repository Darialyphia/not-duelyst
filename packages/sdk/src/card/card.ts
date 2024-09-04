import type { GameSession } from '../game-session';
import type { AnyObject, Point3D, Serializable, Values } from '@game/shared';
import type { CardIndex, Player, PlayerId } from '../player/player';
import type { ModifierId } from '../modifier/entity-modifier';
import type { CardModifier } from '../modifier/card-modifier';
import { nanoid } from 'nanoid';
import { TypedEventEmitter } from '../utils/typed-emitter';
import type { CardKind } from './card-enums';
import type { CardBlueprint } from './card-blueprint';
import { PlayCardAction } from '../action/play-card.action';

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
  blueprintId: CardBlueprintId;
  readonly isGenerated: boolean;
  public readonly pedestalId: string;
  public readonly cardBackId: string;
  public name: string;
  public description: string;
  public kind: CardKind;
  public targets: CardBlueprint['targets'];

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
    this.name = this.blueprint.name;
    this.description = this.blueprint.description;
    this.kind = this.blueprint.kind;
    this.targets = this.blueprint.targets;
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

  get isBeingPlayedFromHand() {
    const currentAction = this.session.actionSystem.currentAction;
    if (!currentAction) return false;
    const isCardBeingPlayed = currentAction instanceof PlayCardAction;

    if (!isCardBeingPlayed) return false;
    return this.equals(currentAction.cachedCard);
  }

  abstract get cost(): number;

  abstract canPlayAt(point: Point3D, forcePlayedFromHand?: boolean): boolean;

  abstract playImpl(ctx: {
    position: Point3D;
    targets: Point3D[];
    choice: number;
  }): Promise<boolean>;

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

  async play(ctx: { position: Point3D; targets: Point3D[]; choice: number }) {
    await this.emitAsync(CARD_EVENTS.BEFORE_PLAYED, this);

    const isSuccess = await this.playImpl(ctx);
    if (!isSuccess) return false;

    await this.emitAsync(CARD_EVENTS.AFTER_PLAYED, this);
    return true;
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

import type { GameSession } from '../game-session';
import { CARDS } from './card-lookup';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import type { Point3D, Serializable, Values } from '@game/shared';
import type { CardIndex, PlayerId } from '../player/player';
import EventEmitter from 'eventemitter3';
import type { ModifierId } from '../modifier/entity-modifier';
import type { CardModifier } from '../modifier/card-modifier';
import { ENTITY_EVENTS } from '../entity/entity';

export type CardBlueprintId = string;

export type SerializedCard = {
  blueprintId: CardBlueprintId;
  pedestalId: string;
  isGenerated?: boolean;
};

export type CardInterceptor = Card['interceptors'];

export const CARD_EVENTS = {
  BEFORE_PLAYED: 'before_played',
  AFTER_PLAYED: 'after_played'
} as const;

export type CardEvent = Values<typeof CARD_EVENTS>;

export type CardEventMap = {
  [CARD_EVENTS.BEFORE_PLAYED]: [Card];
  [CARD_EVENTS.AFTER_PLAYED]: [Card];
};

export class Card extends EventEmitter implements Serializable {
  readonly blueprintId: CardBlueprintId;
  readonly isGenerated: boolean;
  public readonly pedestalId: string;
  modifiers: CardModifier[] = [];
  currentCooldown: number;

  constructor(
    protected session: GameSession,
    protected index: CardIndex,
    options: SerializedCard,
    protected playerId: PlayerId
  ) {
    super();
    this.blueprintId = options.blueprintId;
    this.pedestalId = options.pedestalId;
    this.isGenerated = options.isGenerated ?? false;
    this.currentCooldown = this.blueprint.initialCooldown;
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
    return CARDS[this.blueprintId];
  }

  get kind() {
    return this.blueprint.kind;
  }

  get hpCost() {
    const factions = [...this.player.general.card.blueprint.factions];
    let missing = 0;

    this.blueprint.factions.forEach(faction => {
      if (!faction) return;
      const index = factions.findIndex(f => f?.equals(faction));
      if (index < 0) missing++;
      else factions.splice(index, 1);
    });

    return missing;
  }

  protected interceptors = {
    attack: new Interceptable<number, Card>(),
    maxHp: new Interceptable<number, Card>(),
    cost: new Interceptable<number, Card>(),
    cooldown: new Interceptable<number, Card>(),
    canPlayAt: new Interceptable<boolean, { unit: Card; point: Point3D }>(),
    shouldExhaustOnPlay: new Interceptable<boolean, Card>()
  };

  addInterceptor<T extends keyof CardInterceptor>(
    key: T,
    interceptor: inferInterceptor<CardInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
    return () => this.removeInterceptor(key, interceptor);
  }

  removeInterceptor<T extends keyof CardInterceptor>(
    key: T,
    interceptor: inferInterceptor<CardInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }

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

  get cost(): number {
    return this.interceptors.cost.getValue(
      this.player.interceptors.cost.getValue(this.blueprint.cost, this),
      this
    );
  }

  get cooldown(): number {
    return this.interceptors.cost.getValue(
      this.player.interceptors.cost.getValue(this.blueprint.cooldown, this),
      this
    );
  }

  get shouldExhaustOnPlay(): boolean {
    return this.interceptors.shouldExhaustOnPlay.getValue(true, this);
  }

  get attack(): number {
    return this.interceptors.attack.getValue(this.blueprint.attack, this);
  }

  get speed(): number {
    return this.interceptors.attack.getValue(this.blueprint.speed, this);
  }

  get range(): number {
    return this.interceptors.attack.getValue(this.blueprint.range, this);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, this);
  }

  canPlayAt(point: Point3D) {
    if (this.hpCost >= this.player.general.hp) return false;

    const cell = this.session.boardSystem.getCellAt(point);
    if (!cell) return false;
    if (!cell.canSummonAt) return false;

    const nearby = this.session.boardSystem.getNeighbors3D(point);
    const predicate = nearby.some(cell => cell.entity?.player.equals(this.player));

    return this.interceptors.canPlayAt.getValue(predicate, { unit: this, point });
  }

  async play(ctx: { position: Point3D; targets: Point3D[] }) {
    this.emit(CARD_EVENTS.BEFORE_PLAYED, this);
    const entity = this.session.entitySystem.addEntity({
      cardIndex: this.index,
      playerId: this.playerId,
      position: ctx.position
    });
    this.session.fxSystem.playSfxOnEntity(entity.id, {
      resourceName: 'fx_smoke2',
      animationName: 'smokeground',
      offset: { x: 0, y: 20 },
      delay: 200
    });
    await this.blueprint.onPlay?.({
      session: this.session,
      card: this,
      entity,
      followup: ctx.targets
    });
    entity.emit(ENTITY_EVENTS.CREATED, entity);

    if (this.shouldExhaustOnPlay) {
      entity.isExhausted = true;
    }
    this.currentCooldown = this.cooldown;
    this.emit(CARD_EVENTS.AFTER_PLAYED, this);
    return entity;
  }

  onTurnStart() {
    this.currentCooldown = Math.max(this.currentCooldown - 1, 0);
  }

  serialize(): SerializedCard {
    return { blueprintId: this.blueprintId, pedestalId: this.pedestalId };
  }
}

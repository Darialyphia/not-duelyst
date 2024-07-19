import type { GameSession } from '../game-session';
import { CARDS } from './card-lookup';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import type { Point3D, Serializable } from '@game/shared';
import type { CardIndex, PlayerId } from '../player/player';
import { Entity, ENTITY_EVENTS } from '../entity/entity';
import { Card, type SerializedCard } from './card';
import { CARD_KINDS } from './card-enums';

export type UnitInterceptor = Unit['interceptors'];

export class Unit extends Card implements Serializable {
  entity!: Entity;

  constructor(
    session: GameSession,
    index: CardIndex,
    options: SerializedCard,
    playerId: PlayerId
  ) {
    super(session, index, options, playerId);
  }

  get blueprint() {
    const blueprint = CARDS[this.blueprintId];
    if (blueprint.kind !== CARD_KINDS.GENERAL && blueprint.kind !== CARD_KINDS.MINION) {
      throw new Error('Unit has non unit blueprint.');
    }

    return blueprint;
  }

  protected interceptors = {
    attack: new Interceptable<number, Card>(),
    maxHp: new Interceptable<number, Card>(),
    cost: new Interceptable<number, Card>(),
    canPlayAt: new Interceptable<boolean, { unit: Card; point: Point3D }>(),
    canMoveAfterSummon: new Interceptable<boolean, Card>(),
    canAttackAfterSummon: new Interceptable<boolean, Card>(),
    canRetaliateAfterSummon: new Interceptable<boolean, Card>()
  };

  addInterceptor<T extends keyof UnitInterceptor>(
    key: T,
    interceptor: inferInterceptor<UnitInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
    return () => this.removeInterceptor(key, interceptor);
  }

  removeInterceptor<T extends keyof UnitInterceptor>(
    key: T,
    interceptor: inferInterceptor<UnitInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }

  get cost(): number {
    return this.interceptors.cost.getValue(
      this.player.interceptors.cost.getValue(this.blueprint.cost, this),
      this
    );
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

  canPlayAt(point: Point3D): boolean {
    const cell = this.session.boardSystem.getCellAt(point);
    if (!cell) return false;
    if (!cell.canSummonAt) return false;

    const nearby = this.session.boardSystem.getNeighbors3D(point);
    const predicate = nearby.some(cell => cell.entity?.player.equals(this.player));

    return this.interceptors.canPlayAt.getValue(predicate, { unit: this, point });
  }

  playImpl(ctx: { position: Point3D; targets: Point3D[] }) {
    this.entity = this.session.entitySystem.addEntity({
      cardIndex: this.index,
      playerId: this.playerId,
      position: ctx.position
    });

    this.blueprint.onPlay?.({
      session: this.session,
      card: this,
      entity: this.entity,
      targets: ctx.targets
    });

    if (!this.interceptors.canMoveAfterSummon.getValue(false, this)) {
      const unsub = this.entity.addInterceptor('canMove', () => false);
      this.session.once('player:turn_end', unsub);
    }
    if (!this.interceptors.canAttackAfterSummon.getValue(false, this)) {
      const unsub = this.entity.addInterceptor('canAttack', () => false);
      this.session.once('player:turn_end', unsub);
    }
    if (!this.interceptors.canRetaliateAfterSummon.getValue(true, this)) {
      const unsub = this.entity.addInterceptor('canRetaliate', () => false);
      this.session.once('player:turn_end', unsub);
    }

    this.entity.emit(ENTITY_EVENTS.CREATED, this.entity);
  }
}

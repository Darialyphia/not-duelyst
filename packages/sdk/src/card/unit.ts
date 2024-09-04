import { Interceptable, type inferInterceptor } from '../utils/helpers';
import type { Point3D, Serializable } from '@game/shared';
import { Entity, ENTITY_EVENTS } from '../entity/entity';
import { Card, type CardBlueprintId } from './card';
import { CARD_KINDS } from './card-enums';
import { PlayCardAction } from '../action/play-card.action';

export type UnitInterceptor = Unit['interceptors'];

export class Unit extends Card implements Serializable {
  entity!: Entity;

  override get blueprint() {
    const blueprint = this.session.cardBlueprints[this.blueprintId];
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

  canPlayAt(point: Point3D, forcePlayedFromHand = false): boolean {
    const cell = this.session.boardSystem.getCellAt(point);
    if (!cell) return false;
    if (!cell.canSummonAt) return false;

    const predicate =
      this.isBeingPlayedFromHand || forcePlayedFromHand
        ? this.session.boardSystem
            .getNeighbors3D(point)
            .some(cell => cell.entity?.player.equals(this.player))
        : true;

    return this.interceptors.canPlayAt.getValue(predicate, { unit: this, point });
  }

  async playImpl(ctx: { position: Point3D; targets: Point3D[]; choice: number }) {
    if (!this.canPlayAt(ctx.position)) return false;

    this.entity = this.session.entitySystem.addEntity(
      {
        position: ctx.position
      },
      this
    );

    this.blueprint.keywords?.forEach(keyword => {
      this.entity.addKeyword(keyword);
    });

    await this.entity.emitAsync(ENTITY_EVENTS.CREATED, this.entity);
    await this.blueprint.onPlay?.({
      session: this.session,
      card: this,
      entity: this.entity,
      targets: ctx.targets,
      choice: ctx.choice
    });

    if (!this.interceptors.canMoveAfterSummon.getValue(false, this)) {
      this.entity.movementsTaken = this.entity.maxMovements;
    }
    if (!this.interceptors.canAttackAfterSummon.getValue(false, this)) {
      this.entity.attacksTaken = this.entity.maxAttacks;
    }
    if (!this.interceptors.canRetaliateAfterSummon.getValue(true, this)) {
      this.entity.retaliationsDone = this.entity.maxRetaliations;
    }

    return true;
  }

  async transform(newblueprintId: CardBlueprintId) {
    this.blueprintId = newblueprintId;
    this.name = this.blueprint.name;
    this.description = this.blueprint.description;
    this.kind = this.blueprint.kind;
    this.targets = this.blueprint.targets;

    this.blueprint.keywords?.forEach(keyword => {
      this.entity.addKeyword(keyword);
    });

    await this.blueprint.onPlay?.({
      session: this.session,
      card: this,
      entity: this.entity,
      targets: [],
      choice: 0
    });
  }
}

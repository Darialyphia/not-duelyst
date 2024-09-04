import { Interceptable, type inferInterceptor } from '../utils/helpers';
import type { Point3D, Serializable } from '@game/shared';
import { Card } from './card';
import { CARD_KINDS } from './card-enums';

export type SpellInterceptor = Spell['interceptors'];

export class Spell extends Card implements Serializable {
  override get blueprint() {
    const blueprint = this.session.cardBlueprints[this.blueprintId];
    if (blueprint.kind !== CARD_KINDS.SPELL) {
      throw new Error('Spell has non spell blueprint.');
    }

    return blueprint;
  }

  protected interceptors = {
    cost: new Interceptable<number, Card>(),
    canPlayAt: new Interceptable<boolean, { unit: Card; point: Point3D }>()
  };

  addInterceptor<T extends keyof SpellInterceptor>(
    key: T,
    interceptor: inferInterceptor<SpellInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
    return () => this.removeInterceptor(key, interceptor);
  }

  removeInterceptor<T extends keyof SpellInterceptor>(
    key: T,
    interceptor: inferInterceptor<SpellInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }

  get cost(): number {
    return this.interceptors.cost.getValue(
      this.player.interceptors.cost.getValue(this.blueprint.cost, this),
      this
    );
  }

  canPlayAt(point: Point3D): boolean {
    return this.interceptors.canPlayAt.getValue(
      this.targets!.isTargetable(point, {
        session: this.session,
        card: this,
        targets: []
      }),
      { unit: this, point }
    );
  }

  async playImpl(ctx: { position: Point3D; targets: Point3D[]; choice: number }) {
    await this.blueprint.onPlay?.({
      session: this.session,
      card: this,
      targets: ctx.targets,
      choice: ctx.choice
    });

    this.player.sendToGraveyard(this);
    return true;
  }
}

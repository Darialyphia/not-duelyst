import type { GameSession } from '../game-session';
import { CARDS } from './card-lookup';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import type { Point3D, Serializable } from '@game/shared';
import type { CardIndex, PlayerId } from '../player/player';
import { Card, type SerializedCard } from './card';
import { CARD_KINDS } from './card-enums';

export type SpellInterceptor = Spell['interceptors'];

export class Spell extends Card implements Serializable {
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
      this.blueprint.targets!.isTargetable(point, {
        session: this.session,
        card: this,
        targets: []
      }),
      { unit: this, point }
    );
  }

  playImpl(ctx: { position: Point3D; targets: Point3D[] }) {
    this.blueprint.onPlay?.({
      session: this.session,
      card: this,
      targets: [ctx.position, ...ctx.targets]
    });
  }
}

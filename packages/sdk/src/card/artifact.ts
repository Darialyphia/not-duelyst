import { Interceptable, type inferInterceptor } from '../utils/helpers';
import type { Point3D, Serializable } from '@game/shared';
import { Card } from './card';
import { CARD_KINDS } from './card-enums';
import type { PlayerArtifact } from '../player/player-artifact';

export type ArtifactInterceptor = Artifact['interceptors'];

export class Artifact extends Card implements Serializable {
  private playTargets: Point3D[] = [];

  override get blueprint() {
    const blueprint = this.session.cardBlueprints[this.blueprintId];
    if (blueprint.kind !== CARD_KINDS.ARTIFACT) {
      throw new Error('Artifact has non artifact blueprint.');
    }

    return blueprint;
  }

  protected interceptors = {
    cost: new Interceptable<number, Card>(),
    canPlayAt: new Interceptable<boolean, { point: Point3D }>()
  };

  get cost(): number {
    return this.interceptors.cost.getValue(
      this.player.interceptors.cost.getValue(this.blueprint.cost, this),
      this
    );
  }

  addInterceptor<T extends keyof ArtifactInterceptor>(
    key: T,
    interceptor: inferInterceptor<ArtifactInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
    return () => this.removeInterceptor(key, interceptor);
  }

  removeInterceptor<T extends keyof ArtifactInterceptor>(
    key: T,
    interceptor: inferInterceptor<ArtifactInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }

  canPlayAt(point: Point3D): boolean {
    const entity = this.session.entitySystem.getEntityAt(point);
    if (!entity) return false;

    return this.interceptors.canPlayAt.getValue(
      entity.isGeneral && this.player.artifacts.length < 3,
      { point }
    );
  }

  async playImpl(ctx: { position: Point3D; targets: Point3D[]; choice: number }) {
    if (!this.canPlayAt(this.player.general.position)) return false;
    const entity = this.session.entitySystem.getEntityAt(ctx.targets[0]);
    this.playTargets = ctx.targets.slice(1);
    await entity?.player.equipArtifact(this, ctx.choice);

    return true;
  }

  async equip(artifact: PlayerArtifact, choice: number) {
    await this.blueprint.onPlay?.({
      session: this.session,
      card: this,
      artifact,
      targets: this.playTargets,
      choice
    });

    artifact.once('after_destroy', () => {
      this.player.sendToGraveyard(this);
    });
  }
}

import { clamp } from '@hc/shared';
import { EntityId } from '../entity/entity';
import { isAxisAligned } from '../skill/skill-utils';
import { Point3D } from '../types';
import { GameAction } from './action';

export class DisplaceAction extends GameAction<{
  targetId: EntityId;
  origin: Point3D;
  distance: number;
}> {
  readonly name = 'DISPLACE';

  protected async fxImpl() {
    return Promise.resolve();
  }

  get target() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.targetId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.targetId}`);

    return entity;
  }

  get displacementAxis() {
    if (!isAxisAligned(this.target.position, this.payload.origin)) {
      throw new Error('Knock back points must be axis aligned !');
    }

    return this.target.position.x === this.payload.origin.x ? 'y' : 'x';
  }

  getObstacleAtDistance(distance: number) {
    const entity = this.ctx.entityManager.getEntityAt({
      x:
        this.displacementAxis == 'x'
          ? this.target.position.x + distance
          : this.target.position.x,
      y:
        this.displacementAxis == 'y'
          ? this.target.position.y + distance
          : this.target.position.y,
      z: this.target.position.z
    });

    if (entity) return entity;

    const cell = this.ctx.map.getCellAt({
      x:
        this.displacementAxis == 'x'
          ? this.target.position.x + distance
          : this.target.position.x,
      y:
        this.displacementAxis == 'y'
          ? this.target.position.y + distance
          : this.target.position.y,
      z: this.target.position.z + 1
    });

    if (cell) return cell;

    return null;
  }

  get destination() {
    let step = 1;
    if (this.payload.distance < 0) step *= -1;
    if (
      this.target.position[this.displacementAxis] <
      this.payload.origin[this.displacementAxis]
    ) {
      step *= -1;
    }

    const destination = this.target.position.serialize();
    for (let i = 1; i <= Math.abs(this.payload.distance); i++) {
      const obstacle = this.getObstacleAtDistance(step * i);
      if (obstacle) break;

      destination[this.displacementAxis] = clamp(
        destination[this.displacementAxis] + step,
        0,
        this.displacementAxis === 'x' ? this.ctx.map.width - 1 : this.ctx.map.height - 1
      );
    }

    return destination;
  }

  protected impl() {
    if (!isAxisAligned(this.target.position, this.payload.origin)) {
      throw new Error('Knock back points must be axis aligned !');
    }

    this.target.position[this.displacementAxis] = this.destination[this.displacementAxis];
  }
}

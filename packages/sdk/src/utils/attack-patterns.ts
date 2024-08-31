import type { Point3D } from '@game/shared';
import type { Entity } from '../entity/entity';
import { isAxisAligned, isWithinCells } from './targeting';
import type { GameSession } from '../game-session';

export type AttackPattern = {
  canAttackAt(
    position: Point3D,
    simulatedPosition?: Point3D,
    simulatedEntity?: Entity
  ): boolean;
  getAffectedUnits(target: Entity): Entity[];
};

export class DefaultAttackPattern implements AttackPattern {
  constructor(
    private session: GameSession,
    private entity: Entity
  ) {}

  canAttackAt(position: Point3D, simulatedPosition?: Point3D) {
    const cell = this.session.boardSystem.getCellAt(position)!;

    if (!simulatedPosition && !cell.entity?.canBeAttacked(this.entity)) return false;

    return isWithinCells(
      simulatedPosition ?? this.entity.position,
      position,
      this.entity.range
    );
  }

  getAffectedUnits(target: Entity) {
    return [target];
  }
}

export class BlastAttackPattern implements AttackPattern {
  constructor(
    private session: GameSession,
    private entity: Entity
  ) {}

  canAttackAt(position: Point3D, simulatedPosition?: Point3D) {
    const cell = this.session.boardSystem.getCellAt(position)!;
    if (!simulatedPosition && !cell.entity?.canBeAttacked(this.entity)) return false;

    if (isAxisAligned(this.entity.position, position)) {
      return Math.abs(position.z - this.entity.position.z) <= 1;
    }

    return isWithinCells(
      simulatedPosition ?? this.entity.position,
      position,
      this.entity.range
    );
  }

  getAffectedUnits(target: Entity) {
    if (isAxisAligned(this.entity.position, target.position)) {
      return this.session.entitySystem.getList().filter(entity => {
        if (entity.equals(this.entity)) return false;
        if (entity.isAlly(this.entity.id)) return false;
        if (Math.abs(entity.position.z - this.entity.position.z) > 1) return false;

        if (this.entity.position.x === target.position.x) {
          if (entity.position.x !== this.entity.position.x) return false;

          return this.entity.position.y < target.position.y
            ? this.entity.position.y < entity.position.y
            : this.entity.position.y > entity.position.y;
        } else if (this.entity.position.y === target.position.y) {
          if (entity.position.y !== this.entity.position.y) return false;

          return this.entity.position.x < target.position.x
            ? this.entity.position.x < entity.position.x
            : this.entity.position.x > entity.position.x;
        }
      });
    }
    return [target];
  }
}

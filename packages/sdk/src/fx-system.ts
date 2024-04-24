import type { Point, Point3D } from '@game/shared';
import type { EntityId } from './entity/entity';

export type Animation = 'idle' | 'breathing' | 'run' | 'attack' | 'hit' | 'death';

export type FXSystem = {
  moveEntity(
    entityId: EntityId,
    path: Array<{ point: Point3D; duration: number }>
  ): Promise<void>;

  displayDamageIndicator(from: EntityId, to: EntityId, amount: number): Promise<void>;

  attack(attackerId: EntityId, targetId: EntityId): Promise<void>;

  fadeOutEntity(entityId: EntityId, duration: number): Promise<void>;

  displayText(
    text: string,
    entityId: EntityId,
    options: {
      color: string | string[] | number | number[];
      path: { x?: number; y?: number; scale?: number; alpha?: number }[];
      duration: number;
    }
  ): Promise<void>;

  shakeEntity(
    entityId: EntityId,
    opts?: {
      count?: number;
      axis?: 'x' | 'y' | 'both';
      amount?: number;
      totalDuration?: number;
    }
  ): Promise<void>;

  playAnimationUntil(entityId: EntityId, animationName: Animation): () => void;

  playAnimation(
    entityId: EntityId,
    animationName: Animation,
    opts?: {
      framePercentage?: number;
    }
  ): Promise<void>;

  playSfxOnEntity(
    entityId: EntityId,
    options: {
      resourceName: string;
      animationName: string;
      offset?: Point;
      delay?: number;
    }
  ): Promise<void>;

  playSfxOnScreenCenter(options: {
    resourceName: string;
    animationName: string;
    offset?: Point;
    delay?: number;
  }): Promise<void>;

  changeAmbientLightUntil(color: string, strength: number): () => void;

  addLightOnEntityUntil(
    entityId: EntityId,
    options: { color: number; strength: number; offset?: Point }
  ): () => void;
};

export const noopFXContext: FXSystem = {
  moveEntity() {
    return Promise.resolve();
  },

  displayDamageIndicator() {
    return Promise.resolve();
  },

  displayText() {
    return Promise.resolve();
  },

  shakeEntity() {
    return Promise.resolve();
  },

  attack() {
    return Promise.resolve();
  },

  fadeOutEntity() {
    return Promise.resolve();
  },

  playAnimationUntil() {
    return () => void 0;
  },

  playAnimation() {
    return Promise.resolve();
  },

  playSfxOnEntity() {
    return Promise.resolve();
  },

  playSfxOnScreenCenter() {
    return Promise.resolve();
  },

  changeAmbientLightUntil() {
    return () => void 0;
  },

  addLightOnEntityUntil() {
    return () => void 0;
  }
};

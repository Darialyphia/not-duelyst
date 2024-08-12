import type { Point } from '@game/shared';
import type { Entity } from './entity/entity';
import { TypedEventEmitter } from './utils/typed-emitter';

export type Animation =
  | 'idle'
  | 'breathing'
  | 'run'
  | 'attack'
  | 'hit'
  | 'death'
  | 'default'
  | 'active'
  | 'caststart'
  | 'castloop'
  | 'castend'
  | 'projectile';

export type IFxSystem = {
  shakeEntity(
    entity: Entity,
    opts?: {
      axis: 'x' | 'y' | 'both';
      amplitude: number;
      duration: number;
    }
  ): Promise<void>;

  shakeScreen(opts?: {
    axis: 'x' | 'y' | 'both';
    amplitude: number;
    duration: number;
  }): Promise<void>;

  playSfxOnEntity(
    entity: Entity,
    options: {
      resourceName: string;
      animationName: string;
      offset: Point;
      duration: number;
    }
  ): Promise<void>;

  playSfxOnScreenCenter(options: {
    resourceName: string;
    animationName: string;
    offset: Point;
    duration: number;
  }): Promise<void>;

  tintEntity(
    entity: Entity,
    options: {
      color: string;
      strength: number;
      alpha: number;
      duration: number;
    }
  ): Promise<void>;

  tintScreen(options: {
    color: string;
    strength: number;
    alpha: number;
    duration: number;
  }): Promise<void>;

  addLightOnEntity(
    entity: Entity,
    options: {
      color: number;
      strength: number;
      offset: Point;
      alpha: number;
      duration: number;
    }
  ): Promise<void>;

  bloom(options: { strength: number; duration: number }): Promise<void>;
};

type FxEventsMap = {
  [key in keyof IFxSystem]: Parameters<IFxSystem[key]>;
};

export class FXSystem extends TypedEventEmitter<FxEventsMap> implements IFxSystem {
  async addLightOnEntity(...args: Parameters<IFxSystem['addLightOnEntity']>) {
    await this.emitAsync('addLightOnEntity', ...args);
  }
  async bloom(...args: Parameters<IFxSystem['bloom']>) {
    await this.emitAsync('bloom', ...args);
  }
  async playSfxOnEntity(...args: Parameters<IFxSystem['playSfxOnEntity']>) {
    await this.emitAsync('playSfxOnEntity', ...args);
  }
  async playSfxOnScreenCenter(...args: Parameters<IFxSystem['playSfxOnScreenCenter']>) {
    await this.emitAsync('playSfxOnScreenCenter', ...args);
  }
  async shakeEntity(...args: Parameters<IFxSystem['shakeEntity']>) {
    await this.emitAsync('shakeEntity', ...args);
  }
  async shakeScreen(...args: Parameters<IFxSystem['shakeScreen']>) {
    await this.emitAsync('shakeScreen', ...args);
  }
  async tintEntity(...args: Parameters<IFxSystem['tintEntity']>) {
    await this.emitAsync('tintEntity', ...args);
  }
  async tintScreen(...args: Parameters<IFxSystem['tintScreen']>) {
    await this.emitAsync('tintScreen', ...args);
  }
}
